import {
  DEFAULT_DURATIONS,
  TRANSITION_FRAMES,
} from "@/src/engine/config";
import type {
  ProjectInput,
  SceneBlueprint,
  SceneType,
} from "@/src/types/project";

const scene = (
  type: SceneType,
  id: string,
  label: string,
  options: Partial<SceneBlueprint> = {},
): SceneBlueprint => ({
  id,
  type,
  label,
  enabled: true,
  durationInFrames: DEFAULT_DURATIONS[type],
  layoutPreset: type,
  motionPreset: `${type}Classic`,
  transition:
    type === "opening"
      ? undefined
      : { type: "crossDissolve", durationInFrames: TRANSITION_FRAMES },
  ...options,
});

const artworkShowcase = (project: ProjectInput): SceneBlueprint[] => {
  const lot = project.lots[0];
  const scenes = [
    scene("opening", "opening", "Opening"),
    scene("hero", `hero-${lot.id}`, "Hero", { sourceLotId: lot.id }),
  ];
  lot.images.slice(1, 3).forEach((_, index) => {
    scenes.push(
      scene("detail", `detail-${lot.id}-${index + 1}`, `Detail ${index + 1}`, {
        sourceLotId: lot.id,
        sourceImageIndex: index + 1,
      }),
    );
  });
  if (lot.year || lot.medium || lot.dimensions) {
    scenes.push(
      scene("metadata", `metadata-${lot.id}`, "Metadata", {
        sourceLotId: lot.id,
      }),
    );
  }
  if (
    lot.estimateLow !== undefined &&
    lot.estimateHigh !== undefined &&
    lot.currency
  ) {
    scenes.push(
      scene("estimate", `estimate-${lot.id}`, "Estimate", {
        sourceLotId: lot.id,
      }),
    );
  }
  scenes.push(scene("ending", "ending", "Ending"));
  return scenes;
};

const auctionPreview = (project: ProjectInput): SceneBlueprint[] => [
  scene("opening", "opening", "Opening"),
  ...project.lots.slice(0, 5).map((lot, index) =>
    scene("hero", `preview-${lot.id}`, `Lot ${index + 1}`, {
      sourceLotId: lot.id,
    }),
  ),
  scene("ending", "ending", "Ending"),
];

const auctionResult = (project: ProjectInput): SceneBlueprint[] => {
  const lot = project.lots.find((item) => item.salePrice !== undefined) ??
    project.lots[0];
  return [
    scene("opening", "opening", "Opening"),
    scene("hero", `hero-${lot.id}`, "Artwork", { sourceLotId: lot.id }),
    scene("estimate", `estimate-${lot.id}`, "Estimate", {
      sourceLotId: lot.id,
    }),
    scene("result", `result-${lot.id}`, "Result", {
      sourceLotId: lot.id,
    }),
    scene("ending", "ending", "Ending"),
  ];
};

export const buildTemplate = (project: ProjectInput): SceneBlueprint[] => {
  if (project.templateId === "auction-preview") return auctionPreview(project);
  if (project.templateId === "auction-result") return auctionResult(project);
  return artworkShowcase(project);
};
