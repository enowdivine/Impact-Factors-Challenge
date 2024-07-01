import nodemailer from "nodemailer";
import dotenv from "dotenv";
import email from "./templates/template";

dotenv.config();

interface Option {
  from?: string;
  to: string;
  subject: string;
  title: string;
  message: string;
}

export default function mailer(option: Option): void {
  const html: string = email(option.title, option.message);
  const transporter: any = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // secure: true, // Use SSL
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
    sender: "Campus Camer Inc",
    from: option.from || `Campus Camer Inc <noreply@campus-camer.com>`,
    to: option.to,
    bcc: "everything@campus-camer.com",
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
