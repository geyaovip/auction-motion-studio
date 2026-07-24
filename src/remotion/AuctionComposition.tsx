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
  const asset = project.lots
    .flatMap((lot) => lot.images)
    .find((item) => item.id === assetId);
  return asset ? normalizeAsset(asset) : null;
};

const AnimatedText = ({
  node,
  order,
}: {
  node: ResolvedTextNode;
  order: number;
}) => {
  const frame = useCurrentFrame();
  const delay = 6 + order * 7;
  const progress = interpolate(frame, [delay, delay + 18], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        transform: `translateY(${(1 - progress) * 18}px)`,
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
  const maximumScale = asset.lowResolution ? 1.02 : 1.06;
  const cameraScale = interpolate(
    frame,
    [0, scene.durationInFrames],
    [1, maximumScale],
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <>
      {node.blurBackground ? (
        <AbsoluteFill style={{ opacity: 0.22, overflow: "hidden" }}>
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
        }}
      >
        <Img
          src={asset.url}
          style={{
            position: "absolute",
            left: node.placement.offsetX,
            top: node.placement.offsetY,
            width: node.placement.renderedWidth,
            height: node.placement.renderedHeight,
            scale: cameraScale,
            transformOrigin: "50% 50%",
          }}
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
  const fade = Math.min(12, Math.floor(scene.durationInFrames / 3));
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
        return <AnimatedText key={node.id} node={node} order={order} />;
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
