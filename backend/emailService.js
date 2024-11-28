import nodemailer from "nodemailer";

// Konfiguracja transportu
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.REACT_APP_EMAIL_USER,
    pass: process.env.REACT_APP_EMAIL_PASSWORD,
  },
});

// Funkcja generująca HTML dla resetowania hasła
export const generateResetPasswordEmail = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h1 style="color: #4CAF50;">Resetowanie hasła</h1>
      <p>Cześć,</p>
      <p>Otrzymaliśmy prośbę o zresetowanie Twojego hasła.</p>
      <p>Kliknij w poniższy przycisk, aby ustawić nowe hasło:</p>
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
        Resetuj hasło
      </a>
      <p>Jeśli to nie Ty, po prostu zignoruj tę wiadomość.</p>
      <p style="font-size: 12px; color: #555;">
        Uwaga: link wygaśnie za 1 godzinę.
      </p>
    </div>
  `;
};

// Funkcja wysyłająca e-mail
export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.REACT_APP_EMAIL_USER,
    to,
    subject,
    text, // Opcjonalne: treść w formacie zwykłego tekstu
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
