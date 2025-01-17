import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure the transporter
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST, // e.g., smtp.gmail.com
  port: 587, // Use 465 for SSL or 587 for TLS
  secure: false, // Set to true if using port 465
  auth: {
    user: process.env.MAILER_USER, // Your SMTP username
    pass: process.env.MAILER_PASSWORD, // Your SMTP password
  },
  logger: true, // Enable logging
  debug: true,
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates (for development only)
  },
});

// Define a mailer function
export const mailer = async (
  from: string,
  to: string | string[], // Allow single or multiple recipients
  subject: string,
  text: string,
  html: string = ""
): Promise<void> => {
  try {
    // Send the email
    const info = await transporter.sendMail({
      from, // Sender address
      to, // Recipient(s)
      subject, // Subject line
      text, // Plain text body
      html, // HTML body
    });

    // console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
