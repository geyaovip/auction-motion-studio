import type { ProjectInput, TemplateId } from "@/src/types/project";

export type WorkspaceProjectStatus =
  | "draft"
  | "ready"
  | "generated"
  | "exported";

export interface WorkspaceProject {
  id: string;
  updatedAt: string;
  status: WorkspaceProjectStatus;
  progress: number;
  project: ProjectInput;
}

export interface NewProjectDraft {
  templateId: TemplateId;
  projectName: string;
  auctionTitle: string;
  subtitle: string;
  date: string;
  location: string;
  houseName: string;
  aspectRatio: ProjectInput["aspectRatio"];
  themeId: ProjectInput["themeId"];
  coverDataUrl?: string;
}
