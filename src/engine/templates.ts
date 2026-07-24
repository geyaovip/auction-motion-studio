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
  layoutPreset:
    type === "hero"
      ? "全屏作品叠字"
      : type === "detail"
        ? "画中画细节"
        : type === "metadata"
          ? "左图右文资料"
          : type === "estimate"
            ? "数据主导估价"
            : type === "result"
              ? "全屏成交结果"
              : "品牌沉浸",
  motionPreset:
    type === "opening"
      ? "openingReveal"
      : type === "hero"
        ? "heroFocus"
        : type === "detail"
          ? "detailScan"
          : type === "metadata"
            ? "metadataEditorial"
            : type === "estimate"
              ? "estimateReveal"
              : type === "result"
                ? "resultImpact"
                : "endingResolve",
  transition:
    type === "opening"
      ? undefined
      : { type: "crossDissolve", durationInFrames: TRANSITION_FRAMES },
  ...options,
});

const artworkShowcase = (project: ProjectInput): SceneBlueprint[] => {
  const lot = project.lots[0];
  const scenes = [
    scene("opening", "opening", "开场"),
    scene("hero", `hero-${lot.id}`, "作品主视觉", {
      sourceLotId: lot.id,
      layoutPreset: "全屏作品叠字",
    }),
  ];
  lot.images.slice(1, 3).forEach((_, index) => {
    scenes.push(
      scene("detail", `detail-${lot.id}-${index + 1}`, `作品细节 ${index + 1}`, {
        sourceLotId: lot.id,
        sourceImageIndex: index + 1,
        layoutPreset: "画中画细节",
      }),
    );
  });
  if (lot.year || lot.medium || lot.dimensions) {
    scenes.push(
      scene("metadata", `metadata-${lot.id}`, "作品资料", {
        sourceLotId: lot.id,
        layoutPreset: "左图右文资料",
      }),
    );
  }
  if (
    lot.estimateLow !== undefined &&
    lot.estimateHigh !== undefined &&
    lot.currency
  ) {
    scenes.push(
      scene("estimate", `estimate-${lot.id}`, "估价信息", {
        sourceLotId: lot.id,
        layoutPreset: "数据主导估价",
      }),
    );
  }
  scenes.push(scene("ending", "ending", "结尾"));
  return scenes;
};

const auctionPreview = (project: ProjectInput): SceneBlueprint[] => [
  scene("opening", "opening", "专场开场"),
  ...project.lots.slice(0, 5).map((lot, index) =>
    scene("hero", `preview-${lot.id}`, `精选拍品 ${index + 1}`, {
      sourceLotId: lot.id,
      layoutPreset:
        index % 3 === 0
          ? "全屏作品叠字"
          : index % 3 === 1
            ? "左图右文主视觉"
            : "右图左文主视觉",
      motionPreset:
        index % 3 === 0
          ? "heroFocus"
          : index % 3 === 1
            ? "metadataEditorial"
            : "detailScan",
    }),
  ),
  scene("ending", "ending", "专场结尾"),
];

const auctionResult = (project: ProjectInput): SceneBlueprint[] => {
  const resultLots = project.lots
    .filter((item) => item.salePrice !== undefined)
    .slice(0, 5);
  return [
    scene("opening", "opening", "成交回顾"),
    ...resultLots.flatMap((lot, index) => [
      scene("hero", `hero-${lot.id}`, `成交拍品 ${index + 1}`, {
        sourceLotId: lot.id,
        layoutPreset:
          index % 3 === 0
            ? "全屏作品叠字"
            : index % 3 === 1
              ? "左图右文主视觉"
              : "右图左文主视觉",
        motionPreset:
          index % 3 === 0
            ? "heroFocus"
            : index % 3 === 1
              ? "metadataEditorial"
              : "detailScan",
      }),
      scene("result", `result-${lot.id}`, `成交结果 ${index + 1}`, {
        sourceLotId: lot.id,
        layoutPreset:
          index % 2 === 0 ? "全屏成交结果" : "左图右文资料",
      }),
    ]),
    scene("ending", "ending", "结果发布"),
  ];
};

export const buildTemplate = (project: ProjectInput): SceneBlueprint[] => {
  if (project.templateId === "auction-preview") return auctionPreview(project);
  if (project.templateId === "auction-result") return auctionResult(project);
  return artworkShowcase(project);
};
