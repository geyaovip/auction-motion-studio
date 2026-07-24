export type AspectRatio = "16:9" | "9:16" | "1:1";
export type TemplateId =
  | "artwork-showcase"
  | "auction-preview"
  | "auction-result";
export type ThemeId = "classic-light" | "classic-dark";
export type Currency = "USD" | "GBP" | "EUR" | "HKD" | "CNY" | "SGD";

export interface FocalPoint {
  x: number;
  y: number;
}

export interface AssetInput {
  id: string;
  url: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  alt?: string;
  focalPoint?: FocalPoint;
}

export interface LotInput {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  estimateLow?: number;
  estimateHigh?: number;
  currency?: Currency;
  lotNumber?: string;
  salePrice?: number;
  images: AssetInput[];
  captions?: string[];
}

export interface AuctionInfo {
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  houseName?: string;
  website?: string;
}

export interface ProjectInput {
  projectName: string;
  templateId: TemplateId;
  aspectRatio: AspectRatio;
  themeId: ThemeId;
  logo?: AssetInput;
  lots: LotInput[];
  auction?: AuctionInfo;
}

export interface CanvasConfig {
  width: number;
  height: number;
  fps: 30;
  aspectRatio: AspectRatio;
}

export type SceneType =
  | "opening"
  | "hero"
  | "detail"
  | "metadata"
  | "estimate"
  | "result"
  | "ending";

export interface TransitionConfig {
  type: "crossDissolve";
  durationInFrames: number;
}

export interface SceneBlueprint {
  id: string;
  type: SceneType;
  label: string;
  enabled: boolean;
  durationInFrames: number;
  layoutPreset: string;
  motionPreset: string;
  sourceLotId?: string;
  sourceImageIndex?: number;
  transition?: TransitionConfig;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageOrientation =
  | "panorama"
  | "landscape"
  | "square"
  | "portrait"
  | "ultraPortrait";

export interface NormalizedAsset extends AssetInput {
  width: number;
  height: number;
  orientation: ImageOrientation;
  focalPoint: FocalPoint;
  lowResolution: boolean;
}

export interface ImagePlacement {
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
  fit: "cover" | "contain";
}

interface ResolvedNodeBase {
  id: string;
  bounds: Rect;
  opacity: number;
}

export interface ResolvedImageNode extends ResolvedNodeBase {
  type: "image";
  assetId: string;
  placement: ImagePlacement;
  blurBackground: boolean;
  radius: number;
}

export interface ResolvedTextNode extends ResolvedNodeBase {
  type: "text";
  role:
    | "eyebrow"
    | "title"
    | "artist"
    | "metadata"
    | "estimate"
    | "price"
    | "caption"
    | "logo"
    | "cta";
  lines: string[];
  fontSize: number;
  fontWeight: 400 | 500 | 600;
  lineHeight: number;
  align: "left" | "center" | "right";
  color: string;
  letterSpacing: number;
}

export type ResolvedNode = ResolvedImageNode | ResolvedTextNode;

export interface ResolvedScene extends SceneBlueprint {
  nodes: ResolvedNode[];
  background: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  startFrame: number;
  endFrame: number;
}

export interface ResolvedTimeline {
  canvas: CanvasConfig;
  scenes: ResolvedScene[];
  totalDurationInFrames: number;
  fps: 30;
}

export type QualitySeverity = "error" | "warning";

export interface QualityIssue {
  code: string;
  severity: QualitySeverity;
  sceneId: string;
  elementId?: string;
  message: string;
  suggestedFix?: string;
}

export interface QualityReport {
  passed: boolean;
  score: number;
  issues: QualityIssue[];
}

export interface ProjectSnapshot {
  project: ProjectInput;
  scenes: SceneBlueprint[];
}

export interface PipelineResult {
  project: ProjectInput;
  timeline: ResolvedTimeline;
  scenes: SceneBlueprint[];
  qualityReport: QualityReport;
}
