import { describe, expect, it } from "vitest";
import { resolvedImageStyle } from "@/src/remotion/AuctionComposition";

describe("resolved Remotion image style", () => {
  it("keeps overflow dimensions authoritative instead of squeezing the image", () => {
    const style = resolvedImageStyle(
      {
        fit: "cover",
        renderedWidth: 1258.67,
        renderedHeight: 944,
        offsetX: -181.34,
        offsetY: 0,
      },
      -12,
      0,
      1.01,
    );

    expect(style).toMatchObject({
      width: 1258.67,
      height: 944,
      maxWidth: "none",
      maxHeight: "none",
    });
  });
});
