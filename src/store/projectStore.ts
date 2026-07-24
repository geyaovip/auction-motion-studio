"use client";

import { create } from "zustand";
import { demoProject } from "@/src/data/demoProject";
import { runPipeline } from "@/src/engine/pipeline";
import type {
  AssetInput,
  AspectRatio,
  PipelineResult,
  ProjectInput,
  ProjectSnapshot,
  QualityReport,
  ResolvedTimeline,
  SceneBlueprint,
  ThemeId,
} from "@/src/types/project";

interface ProjectStore {
  project: ProjectInput;
  scenes: SceneBlueprint[];
  timeline: ResolvedTimeline;
  qualityReport: QualityReport;
  history: ProjectSnapshot[];
  future: ProjectSnapshot[];
  selectedSceneId: string;
  selectedLotId: string;
  formError?: string;
  loadProject: (project: ProjectInput) => void;
  generate: () => void;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  setTheme: (themeId: ThemeId) => void;
  setProjectCover: (cover: AssetInput) => void;
  updateProjectName: (projectName: string) => void;
  updateAuction: (
    patch: Partial<NonNullable<ProjectInput["auction"]>>,
  ) => void;
  updateLot: (
    lotId: string,
    patch: Partial<ProjectInput["lots"][number]>,
  ) => void;
  selectLot: (lotId: string) => void;
  addLot: () => void;
  addArtwork: (asset: AssetInput) => void;
  removeArtwork: (assetId: string) => void;
  setFocalPoint: (assetId: string, x: number, y: number) => void;
  selectScene: (sceneId: string) => void;
  reorderScene: (from: number, to: number) => void;
  toggleScene: (sceneId: string) => void;
  updateSceneDuration: (sceneId: string, frames: number) => void;
  undo: () => void;
  redo: () => void;
  resetDemo: () => void;
}

const initialResult = runPipeline(demoProject);

const snapshot = (state: ProjectStore): ProjectSnapshot => ({
  project: state.project,
  scenes: state.scenes,
});

const resultState = (
  result: PipelineResult,
): Pick<
  ProjectStore,
  "project" | "scenes" | "timeline" | "qualityReport" | "formError"
> => ({
  project: result.project,
  scenes: result.scenes,
  timeline: result.timeline,
  qualityReport: result.qualityReport,
  formError: undefined,
});

const safePipeline = (
  project: ProjectInput,
  scenes?: SceneBlueprint[],
): PipelineResult | Error => {
  try {
    return runPipeline(project, scenes);
  } catch (error) {
    return error instanceof Error ? error : new Error("项目数据无效");
  }
};

export const useProjectStore = create<ProjectStore>((set) => ({
  ...resultState(initialResult),
  history: [],
  future: [],
  selectedSceneId: initialResult.scenes[1]?.id ?? initialResult.scenes[0].id,
  selectedLotId: initialResult.project.lots[0].id,

  loadProject: (project) =>
    set(() => {
      const result = safePipeline(project);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [],
        future: [],
        selectedSceneId: result.scenes[1]?.id ?? result.scenes[0].id,
        selectedLotId: result.project.lots[0].id,
      };
    }),

  generate: () =>
    set((state) => {
      const result = safePipeline(state.project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return resultState(result);
    }),

  setAspectRatio: (aspectRatio) =>
    set((state) => {
      if (state.project.aspectRatio === aspectRatio) return {};
      const result = safePipeline(
        { ...state.project, aspectRatio },
        state.scenes,
      );
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  setTheme: (themeId) =>
    set((state) => {
      if (state.project.themeId === themeId) return {};
      const result = safePipeline({ ...state.project, themeId }, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  setProjectCover: (cover) =>
    set((state) => {
      if (
        state.project.cover?.id === cover.id &&
        state.project.cover.url === cover.url
      ) {
        return {};
      }
      const result = safePipeline(
        { ...state.project, cover },
        state.scenes,
      );
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  updateProjectName: (projectName) =>
    set((state) => {
      if (state.project.projectName === projectName) return {};
      const result = safePipeline(
        { ...state.project, projectName },
        state.scenes,
      );
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  updateAuction: (patch) =>
    set((state) => {
      const auction = state.project.auction;
      const changed = Object.entries(patch).some(
        ([key, value]) =>
          auction?.[key as keyof NonNullable<ProjectInput["auction"]>] !== value,
      );
      if (!changed) return {};
      const project = {
        ...state.project,
        auction: { ...state.project.auction, ...patch },
      };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  updateLot: (lotId, patch) =>
    set((state) => {
      const currentLot = state.project.lots.find((lot) => lot.id === lotId);
      if (!currentLot) return {};
      const changed = Object.entries(patch).some(
        ([key, value]) =>
          currentLot[key as keyof typeof currentLot] !== value,
      );
      if (!changed) return {};
      const project = {
        ...state.project,
        lots: state.project.lots.map((lot) =>
          lot.id === lotId ? { ...lot, ...patch } : lot,
        ),
      };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  selectLot: (selectedLotId) => set({ selectedLotId }),

  addLot: () =>
    set((state) => {
      const nextNumber = state.project.lots.length + 1;
      const lot = {
        id: `lot-local-${Date.now()}`,
        title: `未命名拍品 ${nextNumber}`,
        lotNumber: `拍品 ${nextNumber}`,
        currency: "CNY" as const,
        images: [
          {
            id: `lot-local-${Date.now()}-image`,
            url: "/demo/artwork-main.jpg",
            width: 1600,
            height: 2089,
            alt: `未命名拍品 ${nextNumber}`,
            focalPoint: { x: 0.5, y: 0.47 },
          },
        ],
      };
      const project = { ...state.project, lots: [...state.project.lots, lot] };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        selectedLotId: lot.id,
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  addArtwork: (asset) =>
    set((state) => {
      const project = {
        ...state.project,
        lots: state.project.lots.map((lot) =>
          lot.id === state.selectedLotId
            ? { ...lot, images: [...lot.images, asset] }
            : lot,
        ),
      };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  removeArtwork: (assetId) =>
    set((state) => {
      const lot =
        state.project.lots.find((item) => item.id === state.selectedLotId) ??
        state.project.lots[0];
      if (lot.images.length <= 1) {
        return { formError: "至少保留一张主图" };
      }
      const project = {
        ...state.project,
        lots: state.project.lots.map((item) =>
          item.id === lot.id
            ? {
                ...item,
                images: item.images.filter((asset) => asset.id !== assetId),
              }
            : item,
        ),
      };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  setFocalPoint: (assetId, x, y) =>
    set((state) => {
      const clamped = {
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
      };
      const current = state.project.lots
        .flatMap((lot) => lot.images)
        .find((asset) => asset.id === assetId);
      if (
        current &&
        (current.focalPoint?.x ?? 0.5) === clamped.x &&
        (current.focalPoint?.y ?? 0.5) === clamped.y
      ) {
        return {};
      }
      const project = {
        ...state.project,
        lots: state.project.lots.map((lot) => ({
          ...lot,
          images: lot.images.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  focalPoint: clamped,
                }
              : asset,
          ),
        })),
      };
      const result = safePipeline(project, state.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  selectScene: (selectedSceneId) => set({ selectedSceneId }),

  reorderScene: (from, to) =>
    set((state) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= state.scenes.length ||
        to >= state.scenes.length
      ) {
        return {};
      }
      const scenes = [...state.scenes];
      const [moved] = scenes.splice(from, 1);
      scenes.splice(to, 0, moved);
      const result = safePipeline(state.project, scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  toggleScene: (sceneId) =>
    set((state) => {
      const scenes = state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, enabled: !scene.enabled } : scene,
      );
      const result = safePipeline(state.project, scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  updateSceneDuration: (sceneId, frames) =>
    set((state) => {
      const scenes = state.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, durationInFrames: Math.round(frames) }
          : scene,
      );
      const result = safePipeline(state.project, scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: [],
      };
    }),

  undo: () =>
    set((state) => {
      const previous = state.history[state.history.length - 1];
      if (!previous) return {};
      const result = safePipeline(previous.project, previous.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: state.history.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, 30),
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return {};
      const result = safePipeline(next.project, next.scenes);
      if (result instanceof Error) return { formError: result.message };
      return {
        ...resultState(result),
        history: [...state.history, snapshot(state)].slice(-30),
        future: state.future.slice(1),
      };
    }),

  resetDemo: () =>
    set({
      ...resultState(runPipeline(demoProject)),
      history: [],
      future: [],
      selectedSceneId: initialResult.scenes[1]?.id ?? initialResult.scenes[0].id,
      selectedLotId: initialResult.project.lots[0].id,
    }),
}));
