import { Hono } from "hono";
import {
  OrgPermMiddlewareVar,
  requireOrgMember,
  requireOrgPermission,
} from "@/middleware/auth";
import { ExternalDatabaseService } from "@/services/ExternalDatabaseService";
import {
  DatabaseCreateSchema,
  DatabaseRenameSchema,
  DatabaseRotateSchema,
} from "@rmanager/shared/lib/types/database-types";

const databases = new Hono<{ Variables: OrgPermMiddlewareVar }>();

// List Databases
databases.get("/", requireOrgMember, async (c) => {
  const orgId = c.req.param("orgId")!;
  const dbs = await ExternalDatabaseService.ListDatabase(orgId);
  return c.json(dbs);
});

// Create Database
databases.post(
  "/",
  requireOrgPermission({ database: ["create"] }),
  async (c) => {
    const body = DatabaseCreateSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const session = c.var.session;

    const db = await ExternalDatabaseService.LinkDatabase(
      session.user.id,
      orgId,
      body.name,
      {
        EndpointURL: body.endpoint,
        AccessKeyID: body.accessKey,
        BucketName: body.bucketName,
        Region: body.region,
        SecretAccessKey: body.secretKey,
      },
    );

    return c.json(db);
  },
);

// Delete Database
databases.delete(
  "/:dbId",
  requireOrgPermission({ database: ["delete"] }),
  async (c) => {
    const orgId = c.req.param("orgId")!;
    const dbId = c.req.param("dbId");

    const deletedDb = await ExternalDatabaseService.DeleteDatabase(orgId, dbId);
    return c.json(deletedDb);
  },
);

// Rename Database
databases.patch(
  "/:dbId",
  requireOrgPermission({ database: ["rename"] }),
  async (c) => {
    const body = DatabaseRenameSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const dbId = c.req.param("dbId");

    const renamedDb = await ExternalDatabaseService.RenameDatabase(
      orgId,
      dbId,
      body.name,
    );
    return c.json(renamedDb);
  },
);

// Rotate Database Credentials
databases.post(
  "/:dbId",
  requireOrgPermission({ database: ["rotate"] }),
  async (c) => {
    const body = DatabaseRotateSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const dbId = c.req.param("dbId");

    const rotatedDb = await ExternalDatabaseService.RotateDatabaseCredentials(
      orgId,
      dbId,
      { AccessKeyID: body.accessKey, SecretAccessKey: body.secretKey },
    );
    return c.json(rotatedDb);
  },
);

// Refresh Database Status
databases.post(
  "/:dbId/refresh",
  requireOrgPermission({ database: ["refresh"] }),
  async (c) => {
    const orgId = c.req.param("orgId")!;
    const dbId = c.req.param("dbId");

    const refreshedDb = await ExternalDatabaseService.RefreshDatabase(
      orgId,
      dbId,
    );
    return c.json(refreshedDb);
  },
);

export default databases;
