import { db } from "../db";
import * as schema from "../db/schema";
import { APIError, betterAuth } from "better-auth";
import { admin, organization, twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailTransporter } from "./email";
import { dash } from "@better-auth/infra";
import {
  ac,
  owner,
  admin as adminRole,
  developer,
  viewer,
} from "./permissions";
import { ApiError } from "./utils/api-utils";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  experimental: {
    joins: true,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for"],
    },
  },
  appName: "rManager",
  trustedOrigins: process.env.TRUSTED_ORIGIN ? [process.env.TRUSTED_ORIGIN] : [],
  plugins: [
    dash(),
    admin(),
    twoFactor({
      backupCodeOptions: {
        storeBackupCodes: "encrypted",
      },
    }),
    organization({
      ac,
      roles: {
        owner,
        admin: adminRole,
        developer,
        viewer,
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization }) => {
          if (!organization.name || organization.name.length < 3)
            throw new APIError("BAD_REQUEST", {
              message: "Organization name must be at least 3 characters",
            });
          if (organization.name.length > 32)
            throw new APIError("BAD_REQUEST", {
              message: "Organization name must be at most 32 characters",
            });
          if (!organization.slug || organization.slug.length < 3)
            throw new APIError("BAD_REQUEST", {
              message: "Organization slug must be at least 3 characters",
            });
          if (organization.slug.length > 32)
            throw new APIError("BAD_REQUEST", {
              message: "Organization slug must be at most 32 characters",
            });
        },
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
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
        let ownedOrgs;
        try {
          ownedOrgs = await db.query.member.findMany({
            where: (member, { eq, and }) =>
              and(eq(member.userId, user.id), eq(member.role, "owner")),
            with: {
              organization: {
                with: {
                  members: {
                    where: (org_member, { eq }) => eq(org_member.role, "owner"),
                  },
                },
              },
            },
          });
        } catch {
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message:
              "An unexpected error occurred while checking your account status. Please try again later.",
          });
        }
        const soleOwnerOrgs = ownedOrgs.filter(
          (org) => org.organization.members.length === 1,
        );

        if (soleOwnerOrgs.length > 0) {
          throw new APIError("BAD_REQUEST", {
            code: "CANNOT_DELETE_ACCOUNT_WHILE_OWNING_ORGANIZATIONS",
            message:
              "Cannot delete account while owning organizations. Please transfer ownership or delete your organizations beforehand.",
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
});
