import type {
  AspectRatio,
  CanvasConfig,
  SceneType,
  ThemeId,
} from "@/src/types/project";

export const CANVAS_PRESETS: Record<AspectRatio, CanvasConfig> = {
  "16:9": { width: 1920, height: 1080, fps: 30, aspectRatio: "16:9" },
  "9:16": { width: 1080, height: 1920, fps: 30, aspectRatio: "9:16" },
  "1:1": { width: 1080, height: 1080, fps: 30, aspectRatio: "1:1" },
};

export const THEME_PRESETS = {
  "classic-light": {
    background: "#f5f2ea",
    surface: "#fffdf8",
    information: "#ebe5da",
    estimate: "#e2d5c2",
    result: "#241e19",
    textPrimary: "#111111",
    textSecondary: "#68645d",
    accent: "#8a6e43",
    overlay: "rgba(0,0,0,0.28)",
  },
  "classic-dark": {
    background: "#0e0e0e",
    surface: "#171717",
    information: "#1d1a17",
    estimate: "#272017",
    result: "#120f0d",
    textPrimary: "#f4f1e8",
    textSecondary: "#a7a39a",
    accent: "#b99a67",
    overlay: "rgba(0,0,0,0.42)",
  },
} satisfies Record<ThemeId, Record<string, string>>;

export const SCENE_DURATION_LIMITS: Record<
  SceneType,
  readonly [number, number]
> = {
  opening: [60, 120],
  hero: [105, 210],
  detail: [75, 150],
  metadata: [75, 135],
  estimate: [60, 120],
  result: [75, 150],
  ending: [60, 120],
};

export const DEFAULT_DURATIONS: Record<SceneType, number> = {
  opening: 72,
  hero: 150,
  detail: 105,
  metadata: 90,
  estimate: 84,
  result: 96,
  ending: 72,
};

export const TRANSITION_FRAMES = 12;
export const GRID = 8;

export const ELONGATED_ARTWORK_CAMERA = {
  cropScale: {
    panorama: {
      "16:9": 1.3,
      "9:16": 1.28,
      "1:1": 1.28,
    },
    ultraPortrait: {
      "16:9": 1.25,
      "9:16": 1.06,
      "1:1": 1.2,
    },
  },
  maximumHalfPanRatio: 0.32,
} as const;

export const ULTRA_PORTRAIT_HERO_LAYOUT: Record<
  AspectRatio,
  { viewportWidthRatio: number; textGap: number }
> = {
  "16:9": { viewportWidthRatio: 0.4, textGap: 96 },
  "9:16": { viewportWidthRatio: 0.83, textGap: 48 },
  "1:1": { viewportWidthRatio: 0.4, textGap: 64 },
};

export const snapToGrid = (value: number): number =>
  Math.round(value / GRID) * GRID;
