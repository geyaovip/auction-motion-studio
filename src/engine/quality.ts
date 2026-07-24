import { normalizeAsset } from "@/src/engine/assets";
import { SCENE_DURATION_LIMITS } from "@/src/engine/config";
import type {
  ProjectInput,
  QualityIssue,
  QualityReport,
  ResolvedTimeline,
} from "@/src/types/project";

const insideCanvas = (
  timeline: ResolvedTimeline,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean =>
  x >= 0 &&
  y >= 0 &&
  x + width <= timeline.canvas.width &&
  y + height <= timeline.canvas.height;

export const checkQuality = (
  project: ProjectInput,
  timeline: ResolvedTimeline,
): QualityReport => {
  const issues: QualityIssue[] = [];

  for (const lot of project.lots) {
    if (!lot.images[0]?.url) {
      issues.push({
        code: "IMAGE_MISSING",
        severity: "error",
        sceneId: `hero-${lot.id}`,
        message: `${lot.lotNumber ?? lot.id} 缺少主图`,
        suggestedFix: "上传至少一张清晰的拍品图片",
      });
    }
    if (!lot.title.trim()) {
      issues.push({
        code: "TITLE_MISSING_USING_UNTITLED",
        severity: "warning",
        sceneId: `hero-${lot.id}`,
        message: `${lot.lotNumber ?? lot.id} 未填写标题，已使用 Untitled`,
        suggestedFix: "补充拍品标题以提升发布质量",
      });
    }
    lot.images.forEach((asset) => {
      if (normalizeAsset(asset).lowResolution) {
        issues.push({
          code: "LOW_RESOLUTION_IMAGE",
          severity: "warning",
          sceneId: `hero-${lot.id}`,
          elementId: asset.id,
          message: `${lot.lotNumber ?? lot.id} 的图片分辨率偏低`,
          suggestedFix: "建议上传长边至少 1600px、短边至少 900px 的图片",
        });
      }
    });
  }

  if (
    project.templateId === "auction-result" &&
    project.lots.every((lot) => lot.salePrice === undefined)
  ) {
    issues.push({
      code: "RESULT_PRICE_MISSING",
      severity: "error",
      sceneId: "result",
      message: "成交结果模板缺少成交价",
      suggestedFix: "填写成交价或更换模板",
    });
  }

  if (timeline.scenes.length === 0) {
    issues.push({
      code: "EMPTY_SCENE",
      severity: "error",
      sceneId: "timeline",
      message: "没有可渲染的场景",
      suggestedFix: "至少启用一个场景",
    });
  }

  for (const scene of timeline.scenes) {
    const [minimum, maximum] = SCENE_DURATION_LIMITS[scene.type];
    if (
      scene.durationInFrames < minimum ||
      scene.durationInFrames > maximum
    ) {
      issues.push({
        code: "INVALID_SCENE_DURATION",
        severity: "error",
        sceneId: scene.id,
        message: `${scene.label} 的时长超出允许范围`,
        suggestedFix: `调整为 ${minimum / 30}–${maximum / 30} 秒`,
      });
    }
    for (const node of scene.nodes) {
      if (
        !insideCanvas(
          timeline,
          node.bounds.x,
          node.bounds.y,
          node.bounds.width,
          node.bounds.height,
        )
      ) {
        issues.push({
          code: "ELEMENT_OUT_OF_BOUNDS",
          severity: "error",
          sceneId: scene.id,
          elementId: node.id,
          message: `${scene.label} 中有元素超出画布`,
        });
      }
      if (
        node.type === "text" &&
        (node.role === "title" || node.role === "estimate") &&
        node.fontSize < 28
      ) {
        issues.push({
          code: "TITLE_TOO_SMALL",
          severity: "error",
          sceneId: scene.id,
          elementId: node.id,
          message: `${scene.label} 的主要文字过小`,
        });
      }
      if (
        node.type === "text" &&
        node.role === "title" &&
        node.lines.length > 2
      ) {
        issues.push({
          code: "TITLE_OVER_TWO_LINES",
          severity: "error",
          sceneId: scene.id,
          elementId: node.id,
          message: `${scene.label} 的标题超过两行`,
        });
      }
    }
  }

  if (!project.logo && !project.auction?.houseName) {
    issues.push({
      code: "LOGO_MISSING",
      severity: "warning",
      sceneId: "opening",
      message: "未上传 Logo，也未填写拍卖行名称",
      suggestedFix: "补充品牌标识以强化视频开场",
    });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 4);
  return {
    passed: errorCount === 0 && score >= 80,
    score,
    issues,
  };
};
