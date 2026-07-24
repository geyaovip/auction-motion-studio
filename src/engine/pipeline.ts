import { buildTemplate } from "@/src/engine/templates";
import { buildTimeline } from "@/src/engine/timeline";
import { checkQuality } from "@/src/engine/quality";
import { projectSchema } from "@/src/schemas/projectSchema";
import type {
  PipelineResult,
  ProjectInput,
  SceneBlueprint,
} from "@/src/types/project";

const cleanOptional = (value: string | undefined): string | undefined => {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
};

export const normalizeProjectInput = (raw: ProjectInput): ProjectInput => {
  const normalized: ProjectInput = {
    ...raw,
    projectName: raw.projectName.trim() || "未命名项目",
    cover: raw.cover
      ? {
          ...raw.cover,
          focalPoint: raw.cover.focalPoint ?? { x: 0.5, y: 0.5 },
        }
      : undefined,
    auction: raw.auction
      ? {
          title: cleanOptional(raw.auction.title),
          subtitle: cleanOptional(raw.auction.subtitle),
          date: cleanOptional(raw.auction.date),
          location: cleanOptional(raw.auction.location),
          houseName: cleanOptional(raw.auction.houseName),
          website: cleanOptional(raw.auction.website),
        }
      : undefined,
    lots: raw.lots.map((lot) => ({
      ...lot,
      title: lot.title.trim() || "未命名作品",
      artist: cleanOptional(lot.artist),
      year: cleanOptional(lot.year),
      medium: cleanOptional(lot.medium),
      dimensions: cleanOptional(lot.dimensions),
      lotNumber: cleanOptional(lot.lotNumber),
      captions: lot.captions?.map((caption) => caption.trim()).filter(Boolean),
      images: lot.images.map((asset) => ({
        ...asset,
        focalPoint: asset.focalPoint ?? { x: 0.5, y: 0.5 },
      })),
    })),
  };
  return projectSchema.parse(normalized) as ProjectInput;
};

const mergeSceneOverrides = (
  built: SceneBlueprint[],
  overrides?: SceneBlueprint[],
): SceneBlueprint[] => {
  if (!overrides || overrides.length === 0) return built;
  const builtMap = new Map(built.map((scene) => [scene.id, scene]));
  const merged = overrides
    .filter((scene) => builtMap.has(scene.id))
    .map((scene) => {
      const source = builtMap.get(scene.id);
      if (!source) return scene;
      builtMap.delete(scene.id);
      return {
        ...source,
        enabled: scene.enabled,
        durationInFrames: scene.durationInFrames,
      };
    });
  return [...merged, ...builtMap.values()];
};

export const runPipeline = (
  raw: ProjectInput,
  overrides?: SceneBlueprint[],
): PipelineResult => {
  const project = normalizeProjectInput(raw);
  const scenes = mergeSceneOverrides(buildTemplate(project), overrides);
  const timeline = buildTimeline(project, scenes);
  const qualityReport = checkQuality(project, timeline);
  return { project, scenes, timeline, qualityReport };
};
