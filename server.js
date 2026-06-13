import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 5600);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname));

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_TO",
];

function missingConfig() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function getTransporter() {
  const smtpPort = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function field(value) {
  return String(value || "").trim();
}

function buildEmailBody(data) {
  const rows = [
    ["Clínica", data["Clínica"]],
    ["Responsável", data["Responsável"]],
    ["E-mail", data.email],
    ["Telefone/WhatsApp", data["Telefone/WhatsApp"]],
    ["Profissionais", data.Profissionais],
    ["Principal interesse", data["Principal interesse"]],
    ["Mensagem", data.Mensagem || "Não informado"],
  ];

  return rows
    .map(([label, value]) => `${label}: ${field(value) || "Não informado"}`)
    .join("\n");
}

app.post("/api/orcamento", async (req, res) => {
  if (field(req.body.site)) {
    return res.status(204).end();
  }

  const missing = missingConfig();
  if (missing.length > 0) {
    return res.status(500).json({
      message: `Configuração de e-mail incompleta: ${missing.join(", ")}`,
    });
  }

  const clinic = field(req.body["Clínica"]);
  const responsible = field(req.body["Responsável"]);
  const email = field(req.body.email);
  const phone = field(req.body["Telefone/WhatsApp"]);

  if (!clinic || !responsible || !email || !phone) {
    return res.status(400).json({ message: "Preencha os campos obrigatórios." });
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"SorrIA Landing Page" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Nova solicitação de orçamento - ${clinic}`,
      text: buildEmailBody(req.body),
    });

    res.status(200).json({ message: "Solicitação enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({ message: "Não foi possível enviar a solicitação." });
  }
});

app.listen(port, () => {
  console.log(`SorrIA landing page rodando em http://localhost:${port}`);
});
