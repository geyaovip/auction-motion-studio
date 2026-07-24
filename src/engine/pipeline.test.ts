import { describe, expect, it } from "vitest";
import { demoProject } from "@/src/data/demoProject";
import { classifyImage } from "@/src/engine/assets";
import { runPipeline } from "@/src/engine/pipeline";
import { fitText } from "@/src/engine/typography";

describe("auction motion pipeline", () => {
  it("is deterministic for the same input", () => {
    expect(runPipeline(demoProject)).toEqual(runPipeline(demoProject));
  });

  it("builds all supported aspect ratios at 30 fps", () => {
    for (const aspectRatio of ["9:16", "16:9", "1:1"] as const) {
      const result = runPipeline({ ...demoProject, aspectRatio });
      expect(result.timeline.canvas.aspectRatio).toBe(aspectRatio);
      expect(result.timeline.fps).toBe(30);
      expect(result.timeline.totalDurationInFrames).toBeGreaterThan(0);
    }
  });

  it("builds a result scene for auction-result", () => {
    const result = runPipeline({
      ...demoProject,
      templateId: "auction-result",
    });
    expect(result.scenes.some((scene) => scene.type === "result")).toBe(true);
  });

  it("classifies artwork orientation at stable boundaries", () => {
    expect(classifyImage(2000, 900)).toBe("panorama");
    expect(classifyImage(1600, 1200)).toBe("landscape");
    expect(classifyImage(1200, 1200)).toBe("square");
    expect(classifyImage(900, 1400)).toBe("portrait");
    expect(classifyImage(700, 1600)).toBe("ultraPortrait");
  });

  it("fits long titles inside the configured line count", () => {
    const fitted = fitText({
      text: "A Particularly Long and Descriptive Title for an Important Work",
      maxWidth: 550,
      maxHeight: 170,
      maxFontSize: 62,
      minFontSize: 22,
      maxLines: 3,
      lineHeightRatio: 1.1,
    });
    expect(fitted.lines.length).toBeLessThanOrEqual(3);
    expect(fitted.fontSize).toBeGreaterThanOrEqual(22);
  });
});
