import { createTransport } from "nodemailer";

export const emailTransporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
