import { normalizeAsset } from "@/src/engine/assets";
import {
  CANVAS_PRESETS,
  ELONGATED_ARTWORK_CAMERA,
  snapToGrid,
  THEME_PRESETS,
  ULTRA_PORTRAIT_HERO_LAYOUT,
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

const centeredMediaHorizontal = (
  canvas: CanvasConfig,
  safe: SafeArea,
): Pick<Rect, "x" | "width"> => {
  const inset = snapToGrid((safe.left + safe.right) / 2);
  return {
    x: inset,
    width: canvas.width - inset * 2,
  };
};

const buildPlacement = (
  asset: NormalizedAsset,
  bounds: Rect,
  fit: "cover" | "contain",
  cropScale = 1,
): ImagePlacement => {
  const baseScale =
    fit === "cover"
      ? Math.max(bounds.width / asset.width, bounds.height / asset.height)
      : Math.min(bounds.width / asset.width, bounds.height / asset.height);
  const scale = baseScale * cropScale;
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
  opacity = 1,
  cropScale = 1,
): ResolvedImageNode => ({
  id,
  type: "image",
  assetId: asset.id,
  bounds,
  placement: buildPlacement(asset, bounds, fit, cropScale),
  blurBackground,
  radius: 0,
  opacity,
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
  preset: string,
): { image: Rect; text: Rect } => {
  if (canvas.aspectRatio === "16:9") {
    const reverse = preset === "右图左文主视觉";
    return {
      image: {
        x: reverse ? snapToGrid(canvas.width * 0.43) : safe.left,
        y: snapToGrid(safe.top + 56),
        width: snapToGrid(canvas.width * 0.52),
        height: snapToGrid(canvas.height - safe.top - safe.bottom - 112),
      },
      text: {
        x: reverse ? safe.left : snapToGrid(canvas.width * 0.59),
        y: snapToGrid(canvas.height * 0.23),
        width: snapToGrid(canvas.width * 0.34),
        height: snapToGrid(canvas.height * 0.58),
      },
    };
  }
  if (canvas.aspectRatio === "9:16") {
    const reverse = preset === "右图左文主视觉";
    const media = centeredMediaHorizontal(canvas, safe);
    return {
      image: {
        x: media.x,
        y: reverse ? snapToGrid(canvas.height * 0.38) : safe.top + 72,
        width: media.width,
        height: reverse
          ? snapToGrid(canvas.height * 0.46)
          : snapToGrid(canvas.height * 0.55),
      },
      text: {
        x: safe.left,
        y: reverse ? safe.top + 32 : snapToGrid(canvas.height * 0.66),
        width: canvas.width - safe.left - safe.right,
        height: reverse
          ? snapToGrid(canvas.height * 0.22)
          : snapToGrid(canvas.height * 0.18),
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

const elongatedHeroRegions = (
  canvas: CanvasConfig,
  safe: SafeArea,
  orientation: "panorama" | "ultraPortrait",
): { image: Rect; text: Rect } => {
  const contentWidth = canvas.width - safe.left - safe.right;

  if (orientation === "panorama") {
    const media = centeredMediaHorizontal(canvas, safe);
    const imageHeight =
      canvas.aspectRatio === "16:9"
        ? snapToGrid(contentWidth / 3)
        : canvas.aspectRatio === "9:16"
          ? 600
          : 416;
    const imageY =
      canvas.aspectRatio === "9:16" ? safe.top + 72 : safe.top + 40;
    const textGap = canvas.aspectRatio === "9:16" ? 56 : 32;
    return {
      image: {
        x: media.x,
        y: imageY,
        width: media.width,
        height: imageHeight,
      },
      text: {
        x: safe.left,
        y: imageY + imageHeight + textGap,
        width: contentWidth,
        height:
          canvas.height -
          safe.bottom -
          (imageY + imageHeight + textGap),
      },
    };
  }

  const portraitLayout =
    ULTRA_PORTRAIT_HERO_LAYOUT[canvas.aspectRatio];
  const imageWidth = snapToGrid(
    canvas.width * portraitLayout.viewportWidthRatio,
  );

  if (canvas.aspectRatio === "16:9") {
    return {
      image: {
        x: safe.left,
        y: safe.top + 40,
        width: imageWidth,
        height: canvas.height - safe.top - safe.bottom - 80,
      },
      text: {
        x: safe.left + imageWidth + portraitLayout.textGap,
        y: snapToGrid(canvas.height * 0.22),
        width:
          contentWidth -
          imageWidth -
          portraitLayout.textGap,
        height: snapToGrid(canvas.height * 0.6),
      },
    };
  }

  if (canvas.aspectRatio === "9:16") {
    const media = centeredMediaHorizontal(canvas, safe);
    const imageY = safe.top + 72;
    const imageHeight = 1056;
    return {
      image: {
        x: media.x,
        y: imageY,
        width: media.width,
        height: imageHeight,
      },
      text: {
        x: safe.left,
        y: imageY + imageHeight + portraitLayout.textGap,
        width: contentWidth,
        height:
          canvas.height -
          safe.bottom -
          (imageY + imageHeight + portraitLayout.textGap),
      },
    };
  }

  return {
    image: {
      x: safe.left,
      y: safe.top + 24,
      width: imageWidth,
      height: 800,
    },
    text: {
      x: safe.left + imageWidth + portraitLayout.textGap,
      y: snapToGrid(canvas.height * 0.2),
      width:
        contentWidth -
        imageWidth -
        portraitLayout.textGap,
      height: snapToGrid(canvas.height * 0.62),
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
  const artwork = normalizeAsset(project.cover ?? project.lots[0].images[0]);
  const title = project.auction?.title || project.projectName;
  const meta = [project.auction?.date, project.auction?.location]
    .filter(Boolean)
    .join(" · ");
  const logo = project.auction?.houseName;
  return [
    imageNode(
      "opening-artwork",
      artwork,
      { x: 0, y: 0, width: canvas.width, height: canvas.height },
      "contain",
      true,
      project.themeId === "classic-dark" ? 0.28 : 0.16,
    ),
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
  const elongated =
    asset.orientation === "panorama" ||
    asset.orientation === "ultraPortrait";
  const fullBleed =
    scene.layoutPreset === "全屏作品叠字" && !elongated;
  const regions = elongated
    ? elongatedHeroRegions(canvas, safe, asset.orientation)
    : heroRegions(canvas, safe, scene.layoutPreset);
  const fit =
    elongated
      ? "cover"
      : asset.lowResolution
      ? "contain"
      : "cover";
  const gap = canvas.aspectRatio === "16:9" ? 104 : 88;
  const titleHeight = elongated
    ? canvas.aspectRatio === "9:16"
      ? 120
      : 88
    : canvas.aspectRatio === "1:1"
      ? 104
      : gap * 2;
  const identity = [lot.year, lot.medium, lot.dimensions]
    .filter(Boolean)
    .join(" · ");
  if (fullBleed) {
    const content = insetRect(canvas, safe);
    const textWidth =
      canvas.aspectRatio === "16:9"
        ? snapToGrid(canvas.width * 0.45)
        : content.width;
    const textY =
      canvas.aspectRatio === "9:16"
        ? snapToGrid(canvas.height * 0.62)
        : snapToGrid(canvas.height * 0.56);
    return [
      imageNode(
        "hero-image",
        asset,
        { x: 0, y: 0, width: canvas.width, height: canvas.height },
        fit,
        fit === "contain",
        project.themeId === "classic-dark" ? 0.72 : 0.62,
      ),
      textNode({
        id: "hero-eyebrow",
        role: "eyebrow",
        text: lot.lotNumber ?? "精选拍品",
        bounds: {
          x: content.x,
          y: textY,
          width: textWidth,
          height: 48,
        },
        min: 24,
        max: 30,
        maxLines: 1,
        weight: 500,
        color: "#d8b47b",
        letterSpacing: 2,
      }),
      textNode({
        id: "hero-title",
        role: "title",
        text: lot.title || "未命名作品",
        bounds: {
          x: content.x,
          y: textY + 64,
          width: textWidth,
          height: canvas.aspectRatio === "9:16" ? 190 : 140,
        },
        min: 32,
        max: canvas.aspectRatio === "16:9" ? 88 : 72,
        maxLines: 2,
        weight: 500,
        color: "#fffdf8",
      }),
      ...(identity
        ? [
            textNode({
              id: "hero-meta",
              role: "metadata",
              text: identity,
              bounds: {
                x: content.x,
                y:
                  textY +
                  (canvas.aspectRatio === "9:16" ? 270 : 220),
                width: textWidth,
                height: 72,
              },
              min: 24,
              max: 30,
              maxLines: 2,
              weight: 400,
              color: "#d9d5cc",
            }),
          ]
        : []),
    ];
  }

  return [
    imageNode(
      "hero-image",
      asset,
      regions.image,
      fit,
      fit === "contain",
      1,
      elongated
        ? ELONGATED_ARTWORK_CAMERA.cropScale[asset.orientation][
            canvas.aspectRatio
          ]
        : 1,
    ),
    textNode({
      id: "hero-eyebrow",
      role: "eyebrow",
      text: lot.lotNumber ?? "精选拍品",
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
      text: lot.title || "未命名作品",
      bounds: {
        x: regions.text.x,
        y: regions.text.y + 64,
        width: regions.text.width,
        height: titleHeight,
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
              y: regions.text.y + 64 + titleHeight + 12,
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
    ...(identity
      ? [
          textNode({
            id: "hero-meta",
            role: "metadata",
            text: identity,
            bounds: {
              x: regions.text.x,
              y: regions.text.y + 64 + titleHeight + 68,
              width: regions.text.width,
              height: canvas.aspectRatio === "16:9" ? 88 : 54,
            },
            min: 20,
            max: 27,
            maxLines: canvas.aspectRatio === "16:9" ? 2 : 1,
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
  const hero = normalizeAsset(lot.images[0]);
  const media = centeredMediaHorizontal(canvas, safe);
  const bounds = {
    x: media.x,
    y: safe.top,
    width: media.width,
    height: canvas.height - safe.top - safe.bottom - 168,
  };
  const caption =
    lot.captions?.[(scene.sourceImageIndex ?? 1) - 1] ?? "作品局部细节";
  const inset = {
    x: snapToGrid(bounds.x + bounds.width * 0.12),
    y: snapToGrid(bounds.y + bounds.height * 0.08),
    width: snapToGrid(bounds.width * 0.76),
    height: snapToGrid(bounds.height * 0.76),
  };
  return [
    imageNode(
      "detail-background",
      hero,
      bounds,
      "cover",
      false,
      project.themeId === "classic-dark" ? 0.28 : 0.16,
    ),
    imageNode("detail-image", asset, inset, "cover", true),
    textNode({
      id: "detail-identity",
      role: "title",
      text: `${lot.lotNumber ?? "精选拍品"} · ${lot.title}`,
      bounds: {
        x: safe.left,
        y: bounds.y + bounds.height + 16,
        width: bounds.width,
        height: 54,
      },
      min: 26,
      max: 36,
      maxLines: 1,
      weight: 500,
      color: colors.textPrimary,
    }),
    textNode({
      id: "detail-caption",
      role: "caption",
      text: caption,
      bounds: {
        x: safe.left,
        y: bounds.y + bounds.height + 76,
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

const informationRegions = (
  canvas: CanvasConfig,
  safe: SafeArea,
): { image: Rect; text: Rect } => {
  if (canvas.aspectRatio === "16:9") {
    return {
      image: {
        x: safe.left,
        y: safe.top + 40,
        width: snapToGrid(canvas.width * 0.5),
        height: canvas.height - safe.top - safe.bottom - 80,
      },
      text: {
        x: snapToGrid(canvas.width * 0.6),
        y: snapToGrid(canvas.height * 0.22),
        width: snapToGrid(canvas.width * 0.32),
        height: snapToGrid(canvas.height * 0.6),
      },
    };
  }
  if (canvas.aspectRatio === "9:16") {
    const media = centeredMediaHorizontal(canvas, safe);
    return {
      image: {
        x: media.x,
        y: safe.top + 48,
        width: media.width,
        height: snapToGrid(canvas.height * 0.49),
      },
      text: {
        x: safe.left,
        y: snapToGrid(canvas.height * 0.62),
        width: canvas.width - safe.left - safe.right,
        height: snapToGrid(canvas.height * 0.22),
      },
    };
  }
  return {
    image: {
      x: safe.left,
      y: safe.top + 24,
      width: snapToGrid(canvas.width * 0.48),
      height: canvas.height - safe.top - safe.bottom - 48,
    },
    text: {
      x: snapToGrid(canvas.width * 0.58),
      y: snapToGrid(canvas.height * 0.2),
      width: snapToGrid(canvas.width * 0.34),
      height: snapToGrid(canvas.height * 0.62),
    },
  };
};

const buildInfoNodes = (
  project: ProjectInput,
  scene: SceneBlueprint,
  canvas: CanvasConfig,
  safe: SafeArea,
  colors: (typeof THEME_PRESETS)[keyof typeof THEME_PRESETS],
): ResolvedNode[] => {
  const lot = findLot(project, scene);
  const asset = normalizeAsset(lot.images[0]);
  const regions = informationRegions(canvas, safe);
  const imageFit = "cover" as const;

  if (scene.type === "metadata") {
    const rows = [lot.year, lot.medium, lot.dimensions].filter(Boolean).join("\n");
    return [
      imageNode(
        "metadata-image",
        asset,
        regions.image,
        imageFit,
        true,
      ),
      textNode({
        id: "metadata-label",
        role: "eyebrow",
        text: lot.lotNumber ?? "作品资料",
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
        id: "metadata-title",
        role: "title",
        text: lot.title,
        bounds: {
          x: regions.text.x,
          y: regions.text.y + 64,
          width: regions.text.width,
          height: 112,
        },
        min: 30,
        max: 52,
        maxLines: 2,
        weight: 500,
        color: colors.textPrimary,
      }),
      textNode({
        id: "metadata-content",
        role: "metadata",
        text: rows.replaceAll("\n", " · "),
        bounds: {
          x: regions.text.x,
          y: regions.text.y + 200,
          width: regions.text.width,
          height: canvas.aspectRatio === "9:16" ? 116 : 184,
        },
        min: 24,
        max: 44,
        maxLines: 2,
        weight: 400,
        color: colors.textPrimary,
      }),
    ];
  }

  const isResult = scene.type === "result";
  const label = isResult ? "成交价" : "拍前估价";
  const value = isResult
    ? `${lot.currency ?? "USD"} ${formatNumber(lot.salePrice ?? 0)}`
    : lot.estimateLow !== undefined &&
        lot.estimateHigh !== undefined &&
        lot.currency
      ? formatEstimate(lot.estimateLow, lot.estimateHigh, lot.currency)
      : "估价待询";
  const infoColors = isResult ? THEME_PRESETS["classic-dark"] : colors;
  if (scene.layoutPreset === "全屏成交结果") {
    const content = insetRect(canvas, safe);
    return [
      imageNode(
        "result-background",
        asset,
        { x: 0, y: 0, width: canvas.width, height: canvas.height },
        "cover",
        false,
        0.2,
      ),
      textNode({
        id: "result-label",
        role: "eyebrow",
        text: label,
        bounds: {
          x: content.x,
          y: snapToGrid(canvas.height * 0.28),
          width: content.width,
          height: 60,
        },
        min: 26,
        max: 36,
        maxLines: 1,
        weight: 500,
        color: infoColors.accent,
        align: "center",
        letterSpacing: 3,
      }),
      textNode({
        id: "result-value",
        role: "price",
        text: value,
        bounds: {
          x: content.x,
          y: snapToGrid(canvas.height * 0.4),
          width: content.width,
          height: 190,
        },
        min: 40,
        max: canvas.aspectRatio === "16:9" ? 124 : 86,
        maxLines: 1,
        weight: 600,
        color: infoColors.textPrimary,
        align: "center",
      }),
      textNode({
        id: "result-title",
        role: "title",
        text: `${lot.lotNumber ?? ""} ${lot.title}`.trim(),
        bounds: {
          x: content.x,
          y: snapToGrid(canvas.height * 0.62),
          width: content.width,
          height: 120,
        },
        min: 28,
        max: 46,
        maxLines: 2,
        weight: 400,
        color: infoColors.textSecondary,
        align: "center",
      }),
    ];
  }

  return [
    imageNode(
      `${scene.type}-image`,
      asset,
      regions.image,
      imageFit,
      true,
    ),
    textNode({
      id: `${scene.type}-label`,
      role: "eyebrow",
      text: label,
      bounds: {
        x: regions.text.x,
        y: regions.text.y,
        width: regions.text.width,
        height: 52,
      },
      min: 24,
      max: 30,
      maxLines: 1,
      weight: 500,
      color: infoColors.accent,
      letterSpacing: 2,
    }),
    textNode({
      id: `${scene.type}-title`,
      role: "title",
      text: lot.title,
      bounds: {
        x: regions.text.x,
        y: regions.text.y + 64,
        width: regions.text.width,
        height: 106,
      },
      min: 28,
      max: 48,
      maxLines: 2,
      weight: 500,
      color: infoColors.textPrimary,
    }),
    textNode({
      id: `${scene.type}-value`,
      role: isResult ? "price" : "estimate",
      text: value,
      bounds: {
        x: regions.text.x,
        y: regions.text.y + 196,
        width: regions.text.width,
        height: 160,
      },
      min: 32,
      max: canvas.aspectRatio === "16:9" ? 92 : 72,
      maxLines: 1,
      weight: 500,
      color: infoColors.textPrimary,
    }),
    textNode({
      id: `${scene.type}-artist`,
      role: "artist",
      text: [lot.artist, lot.lotNumber].filter(Boolean).join(" · "),
      bounds: {
        x: regions.text.x,
        y: regions.text.y + 360,
        width: regions.text.width,
        height: 54,
      },
      min: 20,
      max: 27,
      maxLines: 1,
      weight: 400,
      color: infoColors.textSecondary,
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
  const artwork = normalizeAsset(project.cover ?? project.lots[0].images[0]);
  return [
    imageNode(
      "ending-artwork",
      artwork,
      { x: 0, y: 0, width: canvas.width, height: canvas.height },
      "contain",
      true,
      project.themeId === "classic-dark" ? 0.24 : 0.14,
    ),
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
  const sceneColors =
    scene.type === "result" ? THEME_PRESETS["classic-dark"] : colors;
  let nodes: ResolvedNode[];

  if (scene.type === "opening") {
    nodes = buildOpeningNodes(project, canvas, safe, sceneColors);
  } else if (scene.type === "hero") {
    nodes = buildHeroNodes(project, scene, canvas, safe, sceneColors);
  } else if (scene.type === "detail") {
    nodes = buildDetailNodes(project, scene, canvas, safe, sceneColors);
  } else if (
    scene.type === "metadata" ||
    scene.type === "estimate" ||
    scene.type === "result"
  ) {
    nodes = buildInfoNodes(project, scene, canvas, safe, sceneColors);
  } else {
    nodes = buildEndingNodes(project, canvas, safe, sceneColors);
  }

  return {
    ...scene,
    nodes,
    background:
      scene.type === "result"
        ? sceneColors.result
        : scene.type === "estimate"
          ? sceneColors.estimate
          : scene.type === "metadata"
            ? sceneColors.information
            : scene.type === "detail"
              ? sceneColors.surface
              : sceneColors.background,
    backgroundMode:
      scene.type === "opening" || scene.type === "ending"
        ? "artwork"
        : scene.type === "detail"
          ? "detail"
          : scene.type === "metadata"
            ? "information"
            : scene.type === "estimate"
              ? "estimate"
              : scene.type === "result"
                ? "result"
                : "gallery",
    accent: sceneColors.accent,
    textPrimary: sceneColors.textPrimary,
    textSecondary: sceneColors.textSecondary,
  };
};
