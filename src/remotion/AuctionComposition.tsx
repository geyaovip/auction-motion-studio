import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { normalizeAsset } from "@/src/engine/assets";
import type {
  ProjectInput,
  ImagePlacement,
  ResolvedImageNode,
  ResolvedScene,
  ResolvedTextNode,
  ResolvedTimeline,
} from "@/src/types/project";

export interface AuctionCompositionProps {
  project: ProjectInput;
  timeline: ResolvedTimeline;
}

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

export const resolvedImageStyle = (
  placement: ImagePlacement,
  imageDriftX: number,
  imageDriftY: number,
  cameraScale: number,
): React.CSSProperties => ({
  position: "absolute",
  left: placement.offsetX,
  top: placement.offsetY,
  width: placement.renderedWidth,
  height: placement.renderedHeight,
  maxWidth: "none",
  maxHeight: "none",
  transform: `translate3d(${imageDriftX}px, ${imageDriftY}px, 0) scale(${cameraScale})`,
  transformOrigin: "50% 50%",
});

const AnimatedText = ({
  node,
  order,
  scene,
}: {
  node: ResolvedTextNode;
  order: number;
  scene: ResolvedScene;
}) => {
  const frame = useCurrentFrame();
  const isPrice = node.role === "price" || node.role === "estimate";
  const delay =
    scene.motionPreset === "resultImpact" && isPrice
      ? 24
      : scene.motionPreset === "openingReveal"
        ? 12 + order * 10
        : 7 + order * 7;
  const revealDuration =
    scene.motionPreset === "resultImpact" && isPrice ? 14 : 20;
  const progress = interpolate(frame, [delay, delay + revealDuration], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX =
    scene.motionPreset === "metadataEditorial"
      ? (1 - progress) * 42
      : scene.motionPreset === "detailScan"
        ? (1 - progress) * -24
        : 0;
  const translateY =
    scene.motionPreset === "heroFocus" ||
    scene.motionPreset === "estimateReveal"
      ? (1 - progress) * 22
      : scene.motionPreset === "openingReveal" ||
          scene.motionPreset === "endingResolve"
        ? (1 - progress) * 12
        : 0;
  const textScale =
    scene.motionPreset === "resultImpact" && isPrice
      ? 0.82 + progress * 0.18
      : scene.motionPreset === "openingReveal" && node.role === "title"
        ? 0.96 + progress * 0.04
        : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: node.bounds.x,
        top: node.bounds.y,
        width: node.bounds.width,
        height: node.bounds.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: node.role === "title" ? "flex-start" : "center",
        alignItems:
          node.align === "center"
            ? "center"
            : node.align === "right"
              ? "flex-end"
              : "flex-start",
        color: node.color,
        fontFamily:
          'Arial, "PingFang SC", "Noto Sans SC", Helvetica, sans-serif',
        fontSize: node.fontSize,
        fontWeight: node.fontWeight,
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
        textAlign: node.align,
        opacity: progress,
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${textScale})`,
        transformOrigin:
          node.align === "center"
            ? "50% 50%"
            : node.align === "right"
              ? "100% 50%"
              : "0% 50%",
      }}
    >
      {node.lines.map((line, index) => (
        <div key={`${node.id}-${index}`}>{line}</div>
      ))}
    </div>
  );
};

const AnimatedImage = ({
  node,
  project,
  scene,
}: {
  node: ResolvedImageNode;
  project: ProjectInput;
  scene: ResolvedScene;
}) => {
  const frame = useCurrentFrame();
  const asset = findAsset(project, node.assetId);
  if (!asset) return null;
  const cameraTrack = node.cameraTrack ?? {
    translateX: [0, 0] as const,
    translateY: [0, 0] as const,
    scale: [1, 1] as const,
  };
  const cameraScale = interpolate(
    frame,
    [0, scene.durationInFrames],
    cameraTrack.scale,
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const imageDriftX = interpolate(
    frame,
    [0, scene.durationInFrames],
    cameraTrack.translateX,
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const imageDriftY = interpolate(
    frame,
    [0, scene.durationInFrames],
    cameraTrack.translateY,
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const imageOpacity = interpolate(frame, [0, 14], [0, node.opacity], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {node.blurBackground ? (
        <AbsoluteFill
          style={{ opacity: 0.2 * node.opacity, overflow: "hidden" }}
        >
          <Img
            src={asset.url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(48px)",
              scale: 1.12,
            }}
          />
        </AbsoluteFill>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: node.bounds.x,
          top: node.bounds.y,
          width: node.bounds.width,
          height: node.bounds.height,
          overflow: "hidden",
          borderRadius: node.radius,
          opacity: imageOpacity,
        }}
      >
        <Img
          src={asset.url}
          style={resolvedImageStyle(
            node.placement,
            imageDriftX,
            imageDriftY,
            cameraScale,
          )}
        />
      </div>
    </>
  );
};

const SceneFrame = ({
  scene,
  project,
}: {
  scene: ResolvedScene;
  project: ProjectInput;
}) => {
  const frame = useCurrentFrame();
  const fade =
    scene.motionPreset === "openingReveal"
      ? 18
      : scene.motionPreset === "resultImpact"
        ? 7
        : Math.min(12, Math.floor(scene.durationInFrames / 3));
  const opacity = interpolate(
    frame,
    [0, fade, scene.durationInFrames - fade, scene.durationInFrames],
    [0, 1, 1, 0],
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.background,
        opacity,
        overflow: "hidden",
      }}
    >
      {scene.nodes.map((node, nodeIndex) => {
        if (node.type === "image") {
          return (
            <AnimatedImage
              key={node.id}
              node={node}
              project={project}
              scene={scene}
            />
          );
        }
        const order = scene.nodes
          .slice(0, nodeIndex)
          .filter((previous) => previous.type === "text").length;
        return (
          <AnimatedText
            key={node.id}
            node={node}
            order={order}
            scene={scene}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const AuctionComposition: React.FC<AuctionCompositionProps> = ({
  project,
  timeline,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#0e0e0e" }}>
    {timeline.scenes.map((scene) => (
      <Sequence
        key={scene.id}
        from={scene.startFrame}
        durationInFrames={scene.durationInFrames}
      >
        <SceneFrame scene={scene} project={project} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
