import nodemailer from "nodemailer";

// Konfiguracja transportu
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Funkcja generująca HTML dla resetowania hasła
export const generateResetPasswordEmail = (resetLink, language = "en") => {
  const translations = {
    en: {
      title: "Password Reset",
      greeting: "Hello,",
      content: "We received a request to reset your password.",
      reset: "Click on the button below to set a new password: ",
      button: "Reset Password",
      note: "If this wasn't you, please ignore this email.",
      warning: "Note: Link expires in 1 hour.",
    },
    pl: {
      title: "Resetowanie hasła",
      greeting: "Cześć,",
      content: "Otrzymaliśmy prośbę o zresetowanie Twojego hasła.",
      reset: "Kliknij w poniższy przycisk, aby ustawić nowe hasło: ",
      button: "Resetuj hasło",
      note: "Jeśli to nie Ty, po prostu zignoruj tę wiadomość.",
      warning: "Uwaga: link wygaśnie za 1 godzinę.",
    },
  };

  const { title, greeting, content, reset, button, note, warning } =
    translations[language];

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h1 style="color: #4CAF50;">${title}</h1>
      <p>${greeting}</p>
      <p>${content}</p>
      <p>${reset}</p>
      <a 
        href="${resetLink}" 
        style="
          display: inline-block; 
          padding: 10px 20px; 
          font-size: 16px; 
          color: #fff; 
          background-color: #4CAF50; 
          text-decoration: none; 
          border-radius: 5px;
        "
      >
        ${button}
      </a>
      <p>${note}</p>
      <p style="font-size: 12px; color: #555;">${warning}</p>
    </div>
  `;
};

// Funkcja wysyłająca e-mail
export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html, // Treść w formacie HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email wysłany:", info.response);
    return info;
  } catch (error) {
    console.error("Błąd podczas wysyłania emaila:", error);
    throw error;
  }
};
