import { normalizeAsset } from "@/src/engine/assets";
import { ELONGATED_ARTWORK_CAMERA } from "@/src/engine/config";
import type {
  CameraTrack,
  ProjectInput,
  ResolvedImageNode,
  ResolvedScene,
} from "@/src/types/project";

type SceneWithoutTimeline = Omit<ResolvedScene, "startFrame" | "endFrame">;

const findAsset = (
  project: ProjectInput,
  assetId: string,
) => {
  const asset = [
    ...(project.cover ? [project.cover] : []),
    ...(project.logo ? [project.logo] : []),
    ...project.lots.flatMap((lot) => lot.images),
  ].find((item) => item.id === assetId);
  return asset ? normalizeAsset(asset) : null;
};

const standardTrack = (
  scene: SceneWithoutTimeline,
  node: ResolvedImageNode,
  lowResolution: boolean,
): CameraTrack => {
  const maximumScale = lowResolution ? 1.02 : 1.06;
  const scale: readonly [number, number] =
    scene.motionPreset === "resultImpact"
      ? [1.07, 1]
      : scene.motionPreset === "openingReveal" ||
          scene.motionPreset === "endingResolve"
        ? [1.035, 1.01]
        : scene.motionPreset === "detailScan"
          ? [1.04, 1.075]
          : [1, maximumScale];
  const translateX: readonly [number, number] =
    scene.motionPreset === "detailScan"
      ? [-node.bounds.width * 0.012, node.bounds.width * 0.012]
      : scene.motionPreset === "metadataEditorial"
        ? [-22, 0]
        : [0, 0];

  return { translateX, translateY: [0, 0], scale };
};

const orientedTrack = (
  node: ResolvedImageNode,
  orientation: "panorama" | "ultraPortrait",
): CameraTrack => {
  const maximumHalfPan =
    (orientation === "panorama" ? node.bounds.width : node.bounds.height) *
    ELONGATED_ARTWORK_CAMERA.maximumHalfPanRatio;
  const overflowX = Math.max(
    0,
    node.placement.renderedWidth - node.bounds.width,
  );
  const overflowY = Math.max(
    0,
    node.placement.renderedHeight - node.bounds.height,
  );

  if (orientation === "panorama") {
    const roomBefore = Math.max(0, -node.placement.offsetX);
    const roomAfter = Math.max(
      0,
      overflowX + node.placement.offsetX,
    );
    return {
      translateX: [
        Math.min(maximumHalfPan, roomBefore),
        -Math.min(maximumHalfPan, roomAfter),
      ],
      translateY: [0, 0],
      scale: [1, 1.015],
    };
  }

  const roomBefore = Math.max(0, -node.placement.offsetY);
  const roomAfter = Math.max(0, overflowY + node.placement.offsetY);
  return {
    translateX: [0, 0],
    translateY: [
      Math.min(maximumHalfPan, roomBefore),
      -Math.min(maximumHalfPan, roomAfter),
    ],
    scale: [1, 1.015],
  };
};

export const resolveSceneMotion = (
  project: ProjectInput,
  scene: SceneWithoutTimeline,
): SceneWithoutTimeline => ({
  ...scene,
  nodes: scene.nodes.map((node) => {
    if (node.type !== "image") return node;
    const asset = findAsset(project, node.assetId);
    if (!asset) return node;
    const supportsOrientedPan =
      node.placement.fit === "cover" &&
      (asset.orientation === "panorama" ||
        asset.orientation === "ultraPortrait");
    return {
      ...node,
      cameraTrack: supportsOrientedPan
        ? orientedTrack(node, asset.orientation)
        : standardTrack(scene, node, asset.lowResolution),
    };
  }),
});
