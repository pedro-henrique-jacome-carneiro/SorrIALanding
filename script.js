const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector(".contact-form");
const formFeedback = document.querySelector(".form-feedback");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (window.location.protocol === "file:") {
    formFeedback.textContent = "Abra a página por http://localhost:5600 para enviar o formulário.";
    return;
  }

  const submitButton = contactForm.querySelector("button[type='submit']");
  const formData = new FormData(contactForm);

  submitButton.disabled = true;
  formFeedback.textContent = "Enviando solicitação...";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new URLSearchParams(formData),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Não foi possível enviar a solicitação.");
    }

    contactForm.reset();
    formFeedback.textContent = "Solicitação enviada! Em breve entraremos em contato com a clínica.";
  } catch (error) {
    formFeedback.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});
