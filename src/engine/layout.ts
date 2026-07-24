import { normalizeAsset } from "@/src/engine/assets";
import {
  CANVAS_PRESETS,
  snapToGrid,
  THEME_PRESETS,
} from "@/src/engine/config";
import {
  fitText,
  formatEstimate,
  formatNumber,
} from "@/src/engine/typography";
import type {
  AssetInput,
  CanvasConfig,
  ImagePlacement,
  NormalizedAsset,
  ProjectInput,
  Rect,
  ResolvedImageNode,
  ResolvedNode,
  ResolvedScene,
  ResolvedTextNode,
  SceneBlueprint,
} from "@/src/types/project";

interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const getSafeArea = (canvas: CanvasConfig): SafeArea => {
  if (canvas.aspectRatio === "16:9") {
    return { top: 54, right: 72, bottom: 54, left: 72 };
  }
  if (canvas.aspectRatio === "9:16") {
    return { top: 96, right: 120, bottom: 220, left: 64 };
  }
  return { top: 56, right: 56, bottom: 56, left: 56 };
};

const insetRect = (canvas: CanvasConfig, safe: SafeArea): Rect => ({
  x: safe.left,
  y: safe.top,
  width: canvas.width - safe.left - safe.right,
  height: canvas.height - safe.top - safe.bottom,
});

const buildPlacement = (
  asset: NormalizedAsset,
  bounds: Rect,
  fit: "cover" | "contain",
): ImagePlacement => {
  const scale =
    fit === "cover"
      ? Math.max(bounds.width / asset.width, bounds.height / asset.height)
      : Math.min(bounds.width / asset.width, bounds.height / asset.height);
  const renderedWidth = asset.width * scale;
  const renderedHeight = asset.height * scale;
  const overflowX = Math.max(0, renderedWidth - bounds.width);
  const overflowY = Math.max(0, renderedHeight - bounds.height);

  return {
    fit,
    renderedWidth,
    renderedHeight,
    offsetX:
      fit === "cover"
        ? -overflowX * asset.focalPoint.x
        : (bounds.width - renderedWidth) / 2,
    offsetY:
      fit === "cover"
        ? -overflowY * asset.focalPoint.y
        : (bounds.height - renderedHeight) / 2,
  };
};

const imageNode = (
  id: string,
  asset: NormalizedAsset,
  bounds: Rect,
  fit: "cover" | "contain",
  blurBackground = false,
): ResolvedImageNode => ({
  id,
  type: "image",
  assetId: asset.id,
  bounds,
  placement: buildPlacement(asset, bounds, fit),
  blurBackground,
  radius: 0,
  opacity: 1,
});

interface TextNodeOptions {
  id: string;
  role: ResolvedTextNode["role"];
  text: string;
  bounds: Rect;
  min: number;
  max: number;
  maxLines: number;
  weight?: 400 | 500 | 600;
  color: string;
  align?: "left" | "center" | "right";
  letterSpacing?: number;
}

const textNode = (options: TextNodeOptions): ResolvedTextNode => {
  const result = fitText({
    text: options.text,
    maxWidth: options.bounds.width,
    maxHeight: options.bounds.height,
    maxLines: options.maxLines,
    minFontSize: options.min,
    maxFontSize: options.max,
    lineHeightRatio: 1.12,
  });
  return {
    id: options.id,
    type: "text",
    role: options.role,
    bounds: options.bounds,
    lines: result.lines,
    fontSize: result.fontSize,
    fontWeight: options.weight ?? 500,
    lineHeight: 1.12,
    align: options.align ?? "left",
    color: options.color,
    letterSpacing: options.letterSpacing ?? 0,
    opacity: 1,
  };
};

const findLot = (project: ProjectInput, scene: SceneBlueprint) =>
  project.lots.find((lot) => lot.id === scene.sourceLotId) ?? project.lots[0];

const findAsset = (
  project: ProjectInput,
  scene: SceneBlueprint,
): NormalizedAsset => {
  const lot = findLot(project, scene);
  const raw =
    lot.images[scene.sourceImageIndex ?? 0] ??
    lot.images[0] ??
    ({
      id: "missing",
      url: "",
      width: 1600,
      height: 1200,
    } satisfies AssetInput);
  return normalizeAsset(raw);
};

const heroRegions = (
  canvas: CanvasConfig,
  safe: SafeArea,
): { image: Rect; text: Rect } => {
  if (canvas.aspectRatio === "16:9") {
    return {
      image: {
        x: safe.left,
        y: snapToGrid(safe.top + 56),
        width: snapToGrid(canvas.width * 0.52),
        height: snapToGrid(canvas.height - safe.top - safe.bottom - 112),
      },
      text: {
        x: snapToGrid(canvas.width * 0.59),
        y: snapToGrid(canvas.height * 0.23),
        width: snapToGrid(canvas.width * 0.34),
        height: snapToGrid(canvas.height * 0.58),
      },
    };
  }
  if (canvas.aspectRatio === "9:16") {
    return {
      image: {
        x: safe.left,
        y: safe.top + 72,
        width: canvas.width - safe.left - safe.right,
        height: snapToGrid(canvas.height * 0.55),
      },
      text: {
        x: safe.left,
        y: snapToGrid(canvas.height * 0.66),
        width: canvas.width - safe.left - safe.right,
        height: snapToGrid(canvas.height * 0.18),
      },
    };
  }
  return {
    image: {
      x: safe.left,
      y: safe.top,
      width: canvas.width - safe.left - safe.right,
      height: snapToGrid(canvas.height * 0.58),
    },
    text: {
      x: safe.left,
      y: snapToGrid(canvas.height * 0.67),
      width: canvas.width - safe.left - safe.right,
      height: snapToGrid(canvas.height * 0.24),
    },
  };
};

const buildOpeningNodes = (
  project: ProjectInput,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const content = insetRect(canvas, safe);
  const title = project.auction?.title || project.projectName;
  const meta = [project.auction?.date, project.auction?.location]
    .filter(Boolean)
    .join(" · ");
  const logo = project.auction?.houseName;
  return [
    ...(logo
      ? [
          textNode({
            id: "opening-logo",
            role: "logo",
            text: logo,
            bounds: {
              x: content.x,
              y: content.y,
              width: content.width,
              height: 72,
            },
            min: 28,
            max: 44,
            maxLines: 1,
            weight: 600,
            color: colors.textSecondary,
            letterSpacing: 2,
          }),
        ]
      : []),
    textNode({
      id: "opening-title",
      role: "title",
      text: title,
      bounds: {
        x: content.x,
        y: snapToGrid(canvas.height * 0.36),
        width: content.width,
        height: snapToGrid(canvas.height * 0.23),
      },
      min: 44,
      max: canvas.aspectRatio === "16:9" ? 112 : 92,
      maxLines: 2,
      weight: 500,
      color: colors.textPrimary,
      align: "center",
    }),
    ...(meta
      ? [
          textNode({
            id: "opening-meta",
            role: "metadata",
            text: meta,
            bounds: {
              x: content.x,
              y: snapToGrid(canvas.height * 0.64),
              width: content.width,
              height: 64,
            },
            min: 24,
            max: 34,
            maxLines: 1,
            weight: 400,
            color: colors.textSecondary,
            align: "center",
          }),
        ]
      : []),
  ];
};

const buildHeroNodes = (
  project: ProjectInput,
  scene: SceneBlueprint,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const lot = findLot(project, scene);
  const asset = findAsset(project, scene);
  const regions = heroRegions(canvas, safe);
  const fit =
    asset.orientation === "panorama" ||
    asset.orientation === "ultraPortrait" ||
    asset.lowResolution
      ? "contain"
      : "cover";
  const gap = canvas.aspectRatio === "16:9" ? 104 : 88;
  return [
    imageNode("hero-image", asset, regions.image, fit, fit === "contain"),
    textNode({
      id: "hero-eyebrow",
      role: "eyebrow",
      text: lot.lotNumber ?? "Featured lot",
      bounds: {
        x: regions.text.x,
        y: regions.text.y,
        width: regions.text.width,
        height: 48,
      },
      min: 24,
      max: 30,
      maxLines: 1,
      weight: 500,
      color: colors.accent,
      letterSpacing: 2,
    }),
    textNode({
      id: "hero-title",
      role: "title",
      text: lot.title || "Untitled",
      bounds: {
        x: regions.text.x,
        y: regions.text.y + 64,
        width: regions.text.width,
        height: gap * 2,
      },
      min: 28,
      max: canvas.aspectRatio === "16:9" ? 80 : 68,
      maxLines: 2,
      weight: 500,
      color: colors.textPrimary,
    }),
    ...(lot.artist
      ? [
          textNode({
            id: "hero-artist",
            role: "artist",
            text: lot.artist,
            bounds: {
              x: regions.text.x,
              y: regions.text.y + 64 + gap * 2 + 16,
              width: regions.text.width,
              height: 56,
            },
            min: 24,
            max: 34,
            maxLines: 1,
            weight: 400,
            color: colors.textSecondary,
          }),
        ]
      : []),
  ];
};

const buildDetailNodes = (
  project: ProjectInput,
  scene: SceneBlueprint,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const asset = findAsset(project, scene);
  const lot = findLot(project, scene);
  const bounds = {
    x: safe.left,
    y: safe.top,
    width: canvas.width - safe.left - safe.right,
    height: canvas.height - safe.top - safe.bottom - 104,
  };
  const caption =
    lot.captions?.[(scene.sourceImageIndex ?? 1) - 1] ?? "Artwork detail";
  return [
    imageNode("detail-image", asset, bounds, "cover"),
    textNode({
      id: "detail-caption",
      role: "caption",
      text: caption,
      bounds: {
        x: safe.left,
        y: bounds.y + bounds.height + 32,
        width: bounds.width,
        height: 56,
      },
      min: 24,
      max: 30,
      maxLines: 1,
      weight: 400,
      color: colors.textSecondary,
    }),
  ];
};

const buildInfoNodes = (
  project: ProjectInput,
  scene: SceneBlueprint,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const lot = findLot(project, scene);
  const content = insetRect(canvas, safe);
  const centerY = canvas.height * 0.34;

  if (scene.type === "metadata") {
    const rows = [lot.year, lot.medium, lot.dimensions].filter(Boolean).join("\n");
    return [
      textNode({
        id: "metadata-label",
        role: "eyebrow",
        text: "CATALOGUE",
        bounds: {
          x: content.x,
          y: centerY,
          width: content.width,
          height: 48,
        },
        min: 24,
        max: 30,
        maxLines: 1,
        weight: 500,
        color: colors.accent,
        align: "center",
        letterSpacing: 4,
      }),
      textNode({
        id: "metadata-content",
        role: "metadata",
        text: rows.replaceAll("\n", " · "),
        bounds: {
          x: content.x,
          y: centerY + 80,
          width: content.width,
          height: 184,
        },
        min: 24,
        max: 44,
        maxLines: 2,
        weight: 400,
        color: colors.textPrimary,
        align: "center",
      }),
    ];
  }

  const isResult = scene.type === "result";
  const label = isResult ? "SOLD FOR" : "ESTIMATE";
  const value = isResult
    ? `${lot.currency ?? "USD"} ${formatNumber(lot.salePrice ?? 0)}`
    : lot.estimateLow !== undefined &&
        lot.estimateHigh !== undefined &&
        lot.currency
      ? formatEstimate(lot.estimateLow, lot.estimateHigh, lot.currency)
      : "Estimate on request";
  return [
    textNode({
      id: `${scene.type}-label`,
      role: "eyebrow",
      text: label,
      bounds: {
        x: content.x,
        y: centerY,
        width: content.width,
        height: 52,
      },
      min: 24,
      max: 30,
      maxLines: 1,
      weight: 500,
      color: colors.accent,
      align: "center",
      letterSpacing: 4,
    }),
    textNode({
      id: `${scene.type}-value`,
      role: isResult ? "price" : "estimate",
      text: value,
      bounds: {
        x: content.x,
        y: centerY + 88,
        width: content.width,
        height: 160,
      },
      min: 32,
      max: canvas.aspectRatio === "16:9" ? 92 : 72,
      maxLines: 1,
      weight: 500,
      color: colors.textPrimary,
      align: "center",
    }),
  ];
};

const buildEndingNodes = (
  project: ProjectInput,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const content = insetRect(canvas, safe);
  return [
    textNode({
      id: "ending-logo",
      role: "logo",
      text: project.auction?.houseName ?? project.projectName,
      bounds: {
        x: content.x,
        y: snapToGrid(canvas.height * 0.39),
        width: content.width,
        height: 96,
      },
      min: 36,
      max: 64,
      maxLines: 1,
      weight: 600,
      color: colors.textPrimary,
      align: "center",
      letterSpacing: 2,
    }),
    ...(project.auction?.website
      ? [
          textNode({
            id: "ending-cta",
            role: "cta",
            text: project.auction.website,
            bounds: {
              x: content.x,
              y: snapToGrid(canvas.height * 0.55),
              width: content.width,
              height: 56,
            },
            min: 24,
            max: 32,
            maxLines: 1,
            weight: 400,
            color: colors.textSecondary,
            align: "center",
          }),
        ]
      : []),
  ];
};

export const resolveSceneLayout = (
  project: ProjectInput,
  scene: SceneBlueprint,
): Omit<ResolvedScene, "startFrame" | "endFrame"> => {
  const canvas = CANVAS_PRESETS[project.aspectRatio];
  const safe = getSafeArea(canvas);
  const colors = THEME_PRESETS[project.themeId];
  let nodes: ResolvedNode[];

  if (scene.type === "opening") {
    nodes = buildOpeningNodes(project, canvas, safe, colors);
  } else if (scene.type === "hero") {
    nodes = buildHeroNodes(project, scene, canvas, safe, colors);
  } else if (scene.type === "detail") {
    nodes = buildDetailNodes(project, scene, canvas, safe, colors);
  } else if (
    scene.type === "metadata" ||
    scene.type === "estimate" ||
    scene.type === "result"
  ) {
    nodes = buildInfoNodes(project, scene, canvas, safe, colors);
  } else {
    nodes = buildEndingNodes(project, canvas, safe, colors);
  }

  return {
    ...scene,
    nodes,
    background: colors.background,
    accent: colors.accent,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
  };
};
