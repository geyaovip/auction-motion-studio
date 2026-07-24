import { CANVAS_PRESETS } from "@/src/engine/config";
import { resolveSceneLayout } from "@/src/engine/layout";
import { resolveSceneMotion } from "@/src/engine/motion";
import type {
  ProjectInput,
  ResolvedScene,
  ResolvedTimeline,
  SceneBlueprint,
} from "@/src/types/project";

export const buildTimeline = (
  project: ProjectInput,
  blueprints: SceneBlueprint[],
): ResolvedTimeline => {
  let cursor = 0;
  const scenes: ResolvedScene[] = [];

  blueprints
    .filter((scene) => scene.enabled)
    .forEach((scene, index) => {
      const transition =
        index === 0 ? 0 : scene.transition?.durationInFrames ?? 0;
      const startFrame = Math.max(0, cursor - transition);
      const endFrame = startFrame + scene.durationInFrames;
      const resolvedLayout = resolveSceneLayout(project, scene);
      scenes.push({
        ...resolveSceneMotion(project, resolvedLayout),
        startFrame,
        endFrame,
      });
      cursor = endFrame;
    });

  return {
    canvas: CANVAS_PRESETS[project.aspectRatio],
    scenes,
    totalDurationInFrames: Math.max(cursor, 1),
    fps: 30,
  };
};
