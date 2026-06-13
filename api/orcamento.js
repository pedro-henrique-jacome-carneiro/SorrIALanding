import nodemailer from "nodemailer";

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

function field(value) {
  return String(value || "").trim();
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  return req.body;
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

function buildEmailBody(data) {
  const rows = [
    ["Clinica", data["Clinica"] || data["Clínica"]],
    ["Responsavel", data["Responsavel"] || data["Responsável"]],
    ["E-mail", data.email],
    ["Telefone/WhatsApp", data["Telefone/WhatsApp"]],
    ["Profissionais", data.Profissionais],
    ["Principal interesse", data["Principal interesse"]],
    ["Mensagem", data.Mensagem || "Nao informado"],
  ];

  return rows
    .map(([label, value]) => `${label}: ${field(value) || "Nao informado"}`)
    .join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const data = parseBody(req);

  if (field(data.site)) {
    return res.status(204).end();
  }

  const missing = missingConfig();
  if (missing.length > 0) {
    return res.status(500).json({
      message: `Configuracao de e-mail incompleta: ${missing.join(", ")}`,
    });
  }

  const clinic = field(data["Clinica"] || data["Clínica"]);
  const responsible = field(data["Responsavel"] || data["Responsável"]);
  const email = field(data.email);
  const phone = field(data["Telefone/WhatsApp"]);

  if (!clinic || !responsible || !email || !phone) {
    return res.status(400).json({ message: "Preencha os campos obrigatorios." });
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"SorrIA Landing Page" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Nova solicitacao de orcamento - ${clinic}`,
      text: buildEmailBody(data),
    });

    return res.status(200).json({ message: "Solicitacao enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return res.status(500).json({ message: "Nao foi possivel enviar a solicitacao." });
  }
}
