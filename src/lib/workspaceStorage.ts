"use client";

import { workspaceProjects } from "@/src/data/workspaceProjects";
import {
  workspaceProjectSchema,
  workspaceProjectsSchema,
} from "@/src/schemas/workspaceSchema";
import type { WorkspaceProject } from "@/src/types/workspace";

const STORAGE_KEY = "auction-motion-studio.projects.v6";
const LEGACY_STORAGE_KEYS = [
  "auction-motion-studio.projects.v5",
  "auction-motion-studio.projects.v4",
  "auction-motion-studio.projects.v3",
  "auction-motion-studio.projects.v2",
  "auction-motion-studio.projects.v1",
] as const;
const defaultProjectIds = new Set(workspaceProjects.map((item) => item.id));

const mergeWithDefaults = (
  stored: WorkspaceProject[],
): WorkspaceProject[] => {
  const storedIds = new Set(stored.map((item) => item.id));
  return [
    ...stored,
    ...workspaceProjects.filter((item) => !storedIds.has(item.id)),
  ];
};

export const readWorkspaceProjects = (): WorkspaceProject[] => {
  if (typeof window === "undefined") return workspaceProjects;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return mergeWithDefaults(
        workspaceProjectsSchema.parse(JSON.parse(raw)),
      );
    } catch {
      return workspaceProjects;
    }
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyRaw = window.localStorage.getItem(legacyKey);
    if (!legacyRaw) continue;
    try {
      const legacy = workspaceProjectsSchema.parse(JSON.parse(legacyRaw));
      const customProjects = legacy.filter(
        (item) => !defaultProjectIds.has(item.id),
      );
      const migrated = [...customProjects, ...workspaceProjects];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      continue;
    }
  }

  return workspaceProjects;
};

export const writeWorkspaceProjects = (projects: WorkspaceProject[]): void => {
  const parsed = workspaceProjectsSchema.parse(projects);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
};

export const readWorkspaceProject = (
  id: string,
): WorkspaceProject | undefined =>
  readWorkspaceProjects().find((item) => item.id === id);

export const saveWorkspaceProject = (record: WorkspaceProject): void => {
  const parsed = workspaceProjectSchema.parse(record);
  const existing = readWorkspaceProjects().filter((item) => item.id !== parsed.id);
  writeWorkspaceProjects([parsed, ...existing]);
};
