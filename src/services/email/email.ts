import nodemailer from "nodemailer";
import dotenv from "dotenv";
import email from "./templates/template";
import jwt from "jsonwebtoken";

dotenv.config();

interface Option {
  from?: string;
  to: string;
  subject: string;
  title: string;
  message: string;
}

// Generate a secure unsubscribe link
const generateUnsubscribeLink = (email: string): string => {
  const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Token expires in 7 days
  });
  return `${process.env.SERVER_URL}/api/v1/users/unsubscribe?token=${token}`;
};

export default function sendEmail(option: Option): void {
  const unsubscribeLink = generateUnsubscribeLink(option.to);

  const html: string = email(option.title, option.message, unsubscribeLink);

  const transporter: any = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_USER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as any);
  const mailOptions: any = {
    sender: "Bliss",
    from: option.from || `Bliss <blissdating.contact@gmail.com>`,
    to: option.to,
    // bcc: "blissdating.contact@gmail.com",
    subject: option.subject,
    html: html,
  };
  try {
    const result = transporter.sendMail(mailOptions);
    transporter.close();
    return result;
  } catch (error) {
    console.error(error);
    return;
  }
}
