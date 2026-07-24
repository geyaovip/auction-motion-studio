import { z } from "zod";
import { projectSchema } from "@/src/schemas/projectSchema";

export const workspaceProjectSchema = z.object({
  id: z.string().min(1),
  updatedAt: z.string().min(1),
  status: z.enum(["draft", "ready", "generated", "exported"]),
  progress: z.number().min(0).max(100),
  project: projectSchema,
});

export const workspaceProjectsSchema = z.array(workspaceProjectSchema);

export type WorkspaceProjectSchema = z.infer<typeof workspaceProjectSchema>;
