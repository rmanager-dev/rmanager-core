import { Hono } from "hono";
import { requireOrgMember, requireOrgPermission } from "@/middleware/auth";
import { ProjectService } from "@/services/ProjectService";
import {
  CreateProjectSchema,
  RenameProjectSchema,
} from "@rmanager/shared/lib/types/project-types";

const projects = new Hono();

// List Projects
projects.get("/", requireOrgMember, async (c) => {
  const orgId = c.req.param("orgId")!;

  const projectList = await ProjectService.ListOrganizationProjects(orgId);
  return c.json(projectList);
});

// Create Projects
projects.post("/", requireOrgPermission({ project: ["create"] }), async (c) => {
  const body = CreateProjectSchema.parse(await c.req.json());
  const orgId = c.req.param("orgId")!;

  const newProject = await ProjectService.CreateProject(orgId, body.name);
  return c.json(newProject);
});

// Fetch Project
projects.get("/:projectId", requireOrgMember, async (c) => {
  const orgId = c.req.param("orgId")!;
  const projectId = c.req.param("projectId");

  const projectInfo = await ProjectService.GetProject(orgId, projectId);
  return c.json(projectInfo);
});

// Rename Project
projects.patch(
  "/:projectId",
  requireOrgPermission({ project: ["rename"] }),
  async (c) => {
    const body = RenameProjectSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const projectId = c.req.param("projectId");

    const renamedProject = await ProjectService.RenameProject(
      orgId,
      projectId,
      body.name,
    );
    return c.json(renamedProject);
  },
);

// Delete Project
projects.delete(
  "/:projectId",
  requireOrgPermission({ project: ["delete"] }),
  async (c) => {
    const orgId = c.req.param("orgId")!;
    const projectId = c.req.param("projectId");

    const deletedProject = await ProjectService.DeleteProject(orgId, projectId);
    return c.json(deletedProject);
  },
);

// Fetch By Slug
projects.get("/resolve-slug/:slug", requireOrgMember, async (c) => {
  const orgId = c.req.param("orgId")!;
  const slug = c.req.param("slug");

  const projectInfo = await ProjectService.GetProjectBySlug(orgId, slug);
  return c.json(projectInfo);
});

export default projects;
