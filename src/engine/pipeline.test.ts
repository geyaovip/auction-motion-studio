import { describe, expect, it } from "vitest";
import { demoProject } from "@/src/data/demoProject";
import { workspaceProjects } from "@/src/data/workspaceProjects";
import { classifyImage } from "@/src/engine/assets";
import { runPipeline } from "@/src/engine/pipeline";
import { fitText } from "@/src/engine/typography";

describe("auction motion pipeline", () => {
  it("is deterministic for the same input", () => {
    expect(runPipeline(demoProject)).toEqual(runPipeline(demoProject));
  });

  it("migrates legacy artwork showcases to one visible lot", () => {
    const firstLot = demoProject.lots[0];
    const result = runPipeline({
      ...demoProject,
      lots: [
        firstLot,
        {
          ...firstLot,
          id: "legacy-hidden-lot",
          title: "不应被隐藏保留的拍品",
        },
      ],
    });

    expect(result.project.lots).toHaveLength(1);
    expect(result.project.lots[0].id).toBe(firstLot.id);
    expect(
      result.scenes.every(
        (scene) =>
          scene.sourceLotId === undefined || scene.sourceLotId === firstLot.id,
      ),
    ).toBe(true);
  });

  it("builds all supported aspect ratios at 30 fps", () => {
    for (const aspectRatio of ["9:16", "16:9", "1:1"] as const) {
      const result = runPipeline({ ...demoProject, aspectRatio });
      expect(result.timeline.canvas.aspectRatio).toBe(aspectRatio);
      expect(result.timeline.fps).toBe(30);
      expect(result.timeline.totalDurationInFrames).toBeGreaterThan(0);
      expect(
        result.qualityReport.issues.filter((issue) => issue.severity === "error"),
        `${aspectRatio} 不应出现阻塞性质量问题`,
      ).toEqual([]);
    }
  });

  it("builds a result scene for auction-result", () => {
    const result = runPipeline({
      ...demoProject,
      templateId: "auction-result",
    });
    expect(result.scenes.some((scene) => scene.type === "result")).toBe(true);
  });

  it("builds one hero and result pair for every default sale result lot", () => {
    const project = workspaceProjects.find(
      (record) => record.id === "sale-results",
    )?.project;
    expect(project).toBeDefined();
    if (!project) return;
    const result = runPipeline(project);
    expect(project.lots.length).toBe(3);
    expect(result.scenes.filter((scene) => scene.type === "hero")).toHaveLength(3);
    expect(result.scenes.filter((scene) => scene.type === "result")).toHaveLength(
      3,
    );
  });

  it("keeps artwork and related information together", () => {
    const result = runPipeline(demoProject);
    for (const scene of result.timeline.scenes) {
      if (scene.type === "opening" || scene.type === "ending") continue;
      expect(scene.nodes.some((node) => node.type === "image")).toBe(true);
      expect(scene.nodes.some((node) => node.type === "text")).toBe(true);
    }
  });

  it("assigns semantic backgrounds and distinct motion recipes", () => {
    const result = runPipeline(demoProject);
    expect(new Set(result.timeline.scenes.map((scene) => scene.backgroundMode)).size)
      .toBeGreaterThan(3);
    expect(new Set(result.timeline.scenes.map((scene) => scene.motionPreset)).size)
      .toBeGreaterThan(3);
  });

  it("uses the project cover for opening and alternates preview layouts", () => {
    const showcase = runPipeline(demoProject);
    const openingImage = showcase.timeline.scenes[0].nodes.find(
      (node) => node.type === "image",
    );
    expect(openingImage?.type === "image" ? openingImage.assetId : undefined).toBe(
      demoProject.cover?.id,
    );
    if (openingImage?.type === "image") {
      expect(openingImage.placement.fit).toBe("contain");
      expect(openingImage.blurBackground).toBe(true);
    }

    const previewProject = workspaceProjects.find(
      (record) => record.project.templateId === "auction-preview",
    )?.project;
    expect(previewProject).toBeDefined();
    if (!previewProject) return;
    const preview = runPipeline(previewProject);
    const lotScenes = preview.scenes.filter((scene) => scene.type === "hero");
    expect(new Set(lotScenes.map((scene) => scene.layoutPreset)).size).toBe(3);
    for (let index = 1; index < lotScenes.length; index += 1) {
      expect(lotScenes[index].layoutPreset).not.toBe(
        lotScenes[index - 1].layoutPreset,
      );
    }
  });

  it("keeps the whole opening artwork visible for every supported canvas", () => {
    for (const aspectRatio of ["9:16", "16:9", "1:1"] as const) {
      const result = runPipeline({ ...demoProject, aspectRatio });
      const openingImage = result.timeline.scenes[0].nodes.find(
        (node) => node.type === "image",
      );
      expect(openingImage?.type).toBe("image");
      if (openingImage?.type !== "image") continue;
      expect(openingImage.placement.fit).toBe("contain");
      expect(openingImage.placement.offsetX).toBeGreaterThanOrEqual(0);
      expect(openingImage.placement.offsetY).toBeGreaterThanOrEqual(0);
    }
  });

  it("uses a lot image focal point only when a later scene crops that image", () => {
    const asset = demoProject.lots[0].images[0];
    const withFocalX = (x: number) => ({
      ...demoProject,
      aspectRatio: "9:16" as const,
      lots: [
        {
          ...demoProject.lots[0],
          images: [{ ...asset, focalPoint: { x, y: 0.5 } }],
        },
      ],
    });
    const left = runPipeline(withFocalX(0));
    const right = runPipeline(withFocalX(1));
    const heroImage = (result: typeof left) =>
      result.timeline.scenes
        .find((scene) => scene.type === "hero")
        ?.nodes.find((node) => node.type === "image");
    const leftImage = heroImage(left);
    const rightImage = heroImage(right);

    expect(leftImage?.type).toBe("image");
    expect(rightImage?.type).toBe("image");
    if (leftImage?.type !== "image" || rightImage?.type !== "image") return;
    expect(leftImage.placement.fit).toBe("cover");
    expect(leftImage.placement.offsetX).toBeGreaterThan(
      rightImage.placement.offsetX,
    );
  });

  it("centers bounded media in 9:16 despite asymmetric text safe areas", () => {
    const project = workspaceProjects.find(
      (record) => record.id === "jade-spring",
    )?.project;
    expect(project).toBeDefined();
    if (!project) return;
    const result = runPipeline({ ...project, aspectRatio: "9:16" });

    for (const scene of result.timeline.scenes.filter((item) =>
      item.type === "metadata" || item.type === "estimate"
    )) {
      const image = scene.nodes.find((node) => node.type === "image");
      expect(image?.type).toBe("image");
      if (image?.type !== "image") continue;
      const rightMargin =
        result.timeline.canvas.width -
        image.bounds.x -
        image.bounds.width;
      expect(image.bounds.x).toBe(rightMargin);
    }
  });

  it("classifies artwork orientation at stable boundaries", () => {
    expect(classifyImage(2000, 900)).toBe("panorama");
    expect(classifyImage(1600, 1200)).toBe("landscape");
    expect(classifyImage(1200, 1200)).toBe("square");
    expect(classifyImage(900, 1400)).toBe("portrait");
    expect(classifyImage(700, 1600)).toBe("ultraPortrait");
  });

  it("uses directional camera tracks and separate text regions for long art", () => {
    const project = workspaceProjects.find(
      (record) => record.id === "calligraphy-preview",
    )?.project;
    expect(project).toBeDefined();
    if (!project) return;
    const result = runPipeline(project);
    expect(
      result.qualityReport.issues.filter(
        (issue) => issue.severity === "error",
      ),
    ).toEqual([]);
    expect(
      result.qualityReport.issues
        .filter((issue) => issue.code === "LOW_RESOLUTION_IMAGE")
        .map((issue) => issue.elementId),
    ).toEqual(["jade-calligraphy-main"]);
    const panoramaScene = result.timeline.scenes.find(
      (scene) => scene.sourceLotId === "lot-calligraphy",
    );
    const portraitScene = result.timeline.scenes.find(
      (scene) => scene.sourceLotId === "lot-hanging-scroll",
    );
    const panoramaImage = panoramaScene?.nodes.find(
      (node) => node.type === "image",
    );
    const portraitImage = portraitScene?.nodes.find(
      (node) => node.type === "image",
    );
    const panoramaTitle = panoramaScene?.nodes.find(
      (node) => node.type === "text" && node.role === "title",
    );
    const portraitMetadata = portraitScene?.nodes.find(
      (node) => node.type === "text" && node.role === "metadata",
    );

    const horizontalTrack =
      panoramaImage?.type === "image"
        ? panoramaImage.cameraTrack?.translateX
        : undefined;
    const verticalTrack =
      portraitImage?.type === "image"
        ? portraitImage.cameraTrack?.translateY
        : undefined;
    expect(horizontalTrack?.[0]).toBeGreaterThan(0);
    expect(horizontalTrack?.[1]).toBeLessThan(0);
    expect(
      (horizontalTrack?.[0] ?? 0) - (horizontalTrack?.[1] ?? 0),
    ).toBeGreaterThan(160);
    expect(verticalTrack?.[0]).toBeGreaterThan(0);
    expect(verticalTrack?.[1]).toBeLessThan(0);
    expect(
      (verticalTrack?.[0] ?? 0) - (verticalTrack?.[1] ?? 0),
    ).toBeGreaterThan(160);
    if (panoramaImage?.type === "image") {
      expect(
        panoramaImage.placement.renderedWidth / panoramaImage.bounds.width,
      ).toBeGreaterThan(1.25);
      expect(
        panoramaImage.bounds.height / result.timeline.canvas.height,
      ).toBeGreaterThanOrEqual(0.3);
    }
    if (portraitImage?.type === "image") {
      expect(
        portraitImage.placement.renderedHeight / portraitImage.bounds.height,
      ).toBeGreaterThan(1.25);
      expect(
        portraitImage.bounds.width / result.timeline.canvas.width,
      ).toBeGreaterThanOrEqual(0.39);
    }
    expect(portraitMetadata?.type).toBe("text");
    if (
      panoramaImage?.type === "image" &&
      panoramaTitle?.type === "text"
    ) {
      expect(
        panoramaImage.bounds.x + panoramaImage.bounds.width <=
          panoramaTitle.bounds.x ||
          panoramaTitle.bounds.x + panoramaTitle.bounds.width <=
            panoramaImage.bounds.x ||
          panoramaImage.bounds.y + panoramaImage.bounds.height <=
            panoramaTitle.bounds.y ||
          panoramaTitle.bounds.y + panoramaTitle.bounds.height <=
            panoramaImage.bounds.y,
      ).toBe(true);
    }
  });

  it("stacks elongated artwork above readable copy in portrait video", () => {
    const source = workspaceProjects.find(
      (record) => record.id === "calligraphy-preview",
    )?.project;
    expect(source).toBeDefined();
    if (!source) return;
    const result = runPipeline({ ...source, aspectRatio: "9:16" });
    const elongatedScenes = result.timeline.scenes.filter(
      (scene) =>
        scene.sourceLotId === "lot-calligraphy" ||
        scene.sourceLotId === "lot-hanging-scroll",
    );

    expect(elongatedScenes).toHaveLength(2);
    for (const scene of elongatedScenes) {
      const image = scene.nodes.find((node) => node.type === "image");
      const title = scene.nodes.find(
        (node) => node.type === "text" && node.role === "title",
      );
      expect(image?.type).toBe("image");
      expect(title?.type).toBe("text");
      if (image?.type === "image" && title?.type === "text") {
        expect(image.bounds.width / result.timeline.canvas.width).toBeGreaterThan(
          0.8,
        );
        expect(image.bounds.y + image.bounds.height).toBeLessThanOrEqual(
          title.bounds.y,
        );
      }
    }
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
