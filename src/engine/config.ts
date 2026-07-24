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
    surface: "#ffffff",
    textPrimary: "#111111",
    textSecondary: "#68645d",
    accent: "#8a6e43",
    overlay: "rgba(0,0,0,0.28)",
  },
  "classic-dark": {
    background: "#0e0e0e",
    surface: "#171717",
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

export const snapToGrid = (value: number): number =>
  Math.round(value / GRID) * GRID;
