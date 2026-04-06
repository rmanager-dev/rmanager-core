import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import { APIError, betterAuth } from "better-auth";
import { admin, twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailTransporter } from "./email";
import { and, eq } from "drizzle-orm";
import { TeamService } from "../services/TeamService";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  appName: "rManager",
  trustedOrigins: process.env.VERCEL_URL
    ? [`https://${process.env.VERCEL_URL}`]
    : [],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 256,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await emailTransporter.sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
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
      sendChangeEmailConfirmation: async ({ user, url, newEmail }) => {
        await emailTransporter.sendMail({
          to: user.email,
          subject: "Approve email change",
          text: `A request was made on your account to change your email to ${newEmail}. To continue, please click the following link: ${url}`,
        });
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        let ownedTeams;
        try {
          ownedTeams = await db
            .select()
            .from(schema.team_member)
            .where(
              and(
                eq(schema.team_member.userId, user.id),
                eq(schema.team_member.role, "owner"),
              ),
            );
        } catch {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message:
              "An unexpected error occurred while checking your account status. Please try again later.",
          });
        }
        if (ownedTeams.length > 0) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Cannot delete account while owning teams. Please transfer ownership or delete your teams beforehand.",
          });
        }
      },
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        const baseUrl = new URL(url).origin;
        await emailTransporter.sendMail({
          to: user.email,
          subject: "Account deletion",
          text: `A request was made to delete your account. This action is permanent and cannot be undone. To continue with account deletion, please click the following link: ${baseUrl}/auth/delete-status?token=${token}`,
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
    dash(),
    admin(),
    twoFactor({
      backupCodeOptions: {
        storeBackupCodes: "encrypted",
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await TeamService.CreateTeam(user.id, `${user.email}'s Teams`);
        },
      },
    },
  },
});
