import { Hono } from "hono";
import projects from "./projects";
import databases from "./databases";
import roblox_credentials from "./roblox-credentials";

const org = new Hono
org.route("/:orgId/projects", projects)
org.route("/:orgId/databases", databases)
org.route("/:orgId/roblox-credentials", roblox_credentials)
export default org
