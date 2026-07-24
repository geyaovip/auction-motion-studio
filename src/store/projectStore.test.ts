import { beforeEach, describe, expect, it } from "vitest";
import { demoProject } from "@/src/data/demoProject";
import { useProjectStore } from "@/src/store/projectStore";

describe("project editor history", () => {
  beforeEach(() => {
    useProjectStore.getState().loadProject(demoProject);
  });

  it("undoes and redoes a lot information edit", () => {
    const lot = useProjectStore.getState().project.lots[0];

    useProjectStore.getState().updateLot(lot.id, { title: "撤销测试作品" });
    expect(useProjectStore.getState().project.lots[0].title).toBe(
      "撤销测试作品",
    );
    expect(useProjectStore.getState().history).toHaveLength(1);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.lots[0].title).toBe(lot.title);
    expect(useProjectStore.getState().future).toHaveLength(1);

    useProjectStore.getState().redo();
    expect(useProjectStore.getState().project.lots[0].title).toBe(
      "撤销测试作品",
    );
  });

  it("undoes and redoes a focal-point edit", () => {
    const asset = useProjectStore.getState().project.lots[0].images[0];
    const original = asset.focalPoint ?? { x: 0.5, y: 0.5 };

    useProjectStore.getState().setFocalPoint(asset.id, 0.2, 0.8);
    expect(
      useProjectStore.getState().project.lots[0].images[0].focalPoint,
    ).toEqual({ x: 0.2, y: 0.8 });

    useProjectStore.getState().undo();
    expect(
      useProjectStore.getState().project.lots[0].images[0].focalPoint,
    ).toEqual(original);

    useProjectStore.getState().redo();
    expect(
      useProjectStore.getState().project.lots[0].images[0].focalPoint,
    ).toEqual({ x: 0.2, y: 0.8 });
  });

  it("does not add history entries for unchanged field commits", () => {
    const state = useProjectStore.getState();
    const lot = state.project.lots[0];

    state.updateLot(lot.id, { artist: lot.artist });
    state.updateProjectName(state.project.projectName);
    state.setFocalPoint(
      lot.images[0].id,
      lot.images[0].focalPoint?.x ?? 0.5,
      lot.images[0].focalPoint?.y ?? 0.5,
    );

    expect(useProjectStore.getState().history).toHaveLength(0);
  });

  it("replaces the project cover and restores it with undo", () => {
    const original = useProjectStore.getState().project.cover;
    const replacement = {
      id: "replacement-cover",
      url: "data:image/png;base64,replacement",
      width: 1200,
      height: 800,
      focalPoint: { x: 0.5, y: 0.5 },
    };

    useProjectStore.getState().setProjectCover(replacement);
    expect(useProjectStore.getState().project.cover).toEqual(replacement);
    expect(useProjectStore.getState().timeline.scenes[0].nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "image",
          assetId: replacement.id,
        }),
      ]),
    );

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().project.cover).toEqual(original);
  });
});
