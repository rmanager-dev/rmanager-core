import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailTransporter } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  appName: "rManager",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 256,
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await emailTransporter.sendMail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await emailTransporter.sendMail({
          to: user.email,
          subject: "Approve email change",
          text: `A request was made on your account to change your email to ${newEmail}. To continue, please click the following link: ${url}`,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await emailTransporter.sendMail({
          to: user.email,
          subject: "Account deletion",
          text: `A request was made to delete your account. This action is permanent and cannot be undone. To continue with account deletion, please click the following link: ${url}`,
        });
      },
    },
  },
  rateLimit: {
    enabled: true,
    max: 60,
    window: 60,
  },
  plugins: [
    twoFactor({
      backupCodeOptions: {
        storeBackupCodes: "encrypted",
      },
    }),
  ],
});
