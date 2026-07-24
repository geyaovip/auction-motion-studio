import type {
  AssetInput,
  ImageOrientation,
  NormalizedAsset,
} from "@/src/types/project";

export const classifyImage = (
  width: number,
  height: number,
): ImageOrientation => {
  const ratio = width / height;
  if (ratio >= 2.2) return "panorama";
  if (ratio >= 1.2) return "landscape";
  if (ratio >= 0.85) return "square";
  if (ratio >= 0.58) return "portrait";
  return "ultraPortrait";
};

export const normalizeAsset = (asset: AssetInput): NormalizedAsset => {
  const width = asset.width ?? 1600;
  const height = asset.height ?? 1200;
  const shortEdge = Math.min(width, height);
  const longEdge = Math.max(width, height);

  return {
    ...asset,
    width,
    height,
    orientation: classifyImage(width, height),
    focalPoint: asset.focalPoint ?? { x: 0.5, y: 0.5 },
    lowResolution: longEdge < 1600 || shortEdge < 900,
  };
};
