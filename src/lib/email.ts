import { createTransport } from "nodemailer";

export const emailTransporter = createTransport({
  service: "gmail",
  auth: {
    user: "noreply.rmanager@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
