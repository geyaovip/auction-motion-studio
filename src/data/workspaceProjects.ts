import { demoProject } from "@/src/data/demoProject";
import type { ProjectInput } from "@/src/types/project";
import type { WorkspaceProject } from "@/src/types/workspace";

const projectWith = (
  patch: Partial<ProjectInput>,
  lotPatch: Partial<ProjectInput["lots"][number]> = {},
): ProjectInput => ({
  ...demoProject,
  ...patch,
  auction: { ...demoProject.auction, ...patch.auction },
  lots:
    patch.lots ??
    [
      {
        ...demoProject.lots[0],
        ...lotPatch,
        images: lotPatch.images ?? demoProject.lots[0].images,
      },
    ],
});

const lotWith = (
  id: string,
  patch: Partial<ProjectInput["lots"][number]>,
): ProjectInput["lots"][number] => ({
  ...demoProject.lots[0],
  ...patch,
  id,
  images: patch.images ?? demoProject.lots[0].images,
});

export const workspaceProjects: WorkspaceProject[] = [
  {
    id: "flower-master-hk",
    updatedAt: "2026-07-24T10:42:00+08:00",
    status: "draft",
    progress: 75,
    project: demoProject,
  },
  {
    id: "porcelain-autumn",
    updatedAt: "2026-07-23T16:31:00+08:00",
    status: "ready",
    progress: 100,
    project: projectWith(
      {
        projectName: "青花雅器 · 秋拍精选",
        templateId: "auction-preview",
        aspectRatio: "16:9",
        cover: {
          id: "porcelain-cover",
          url: "/demo/porcelain-vase.png",
          width: 1448,
          height: 1086,
          alt: "青花瓷瓶专场封面",
          focalPoint: { x: 0.5, y: 0.5 },
        },
        auction: {
          title: "青花雅器",
          subtitle: "重要中国瓷器",
          date: "2026 年 10 月 12 日",
          location: "北京",
          houseName: "雅集拍卖",
        },
        lots: [
          lotWith("lot-porcelain", {
            lotNumber: "拍品 52",
            title: "青花缠枝花卉纹瓶",
            artist: "清代",
            medium: "瓷器",
            dimensions: "高 38.2 cm",
            images: [
              {
                id: "porcelain-main",
                url: "/demo/porcelain-vase.png",
                width: 1448,
                height: 1086,
                alt: "青花缠枝花卉纹瓶",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-jade-preview", {
            lotNumber: "拍品 35",
            title: "青玉谷纹璧",
            artist: "战国",
            medium: "青玉",
            dimensions: "直径 18.6 cm",
            images: [
              {
                id: "jade-preview-main",
                url: "/demo/jade-bi.png",
                width: 1448,
                height: 1086,
                alt: "青玉谷纹璧",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-flower-preview", {
            lotNumber: "拍品 18",
            title: "花卉研究之七",
            artist: "林墨",
            medium: "布面油画",
            dimensions: "130.3 × 162 cm",
            images: [
              {
                id: "flower-preview-main",
                url: "/demo/artwork-main.jpg",
                width: 1600,
                height: 2089,
                alt: "花卉研究之七",
                focalPoint: { x: 0.5, y: 0.47 },
              },
            ],
          }),
          lotWith("lot-scroll-preview", {
            lotNumber: "拍品 101",
            title: "行书长卷",
            artist: "近现代",
            medium: "水墨纸本",
            dimensions: "32 × 268 cm",
            images: [
              {
                id: "scroll-preview-main",
                url: "/demo/calligraphy-handscroll.png",
                width: 2700,
                height: 900,
                alt: "行书长卷",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
        ],
      },
    ),
  },
  {
    id: "jade-spring",
    updatedAt: "2026-07-22T14:08:00+08:00",
    status: "generated",
    progress: 100,
    project: projectWith(
      {
        projectName: "玉礼千年 · 春拍",
        templateId: "artwork-showcase",
        cover: {
          id: "jade-cover",
          url: "/demo/jade-bi.png",
          width: 1448,
          height: 1086,
          alt: "青玉谷纹璧项目封面",
          focalPoint: { x: 0.5, y: 0.5 },
        },
        auction: {
          title: "玉礼千年",
          subtitle: "古代玉器重要珍藏",
          date: "2026 年 11 月 6 日",
          location: "上海",
          houseName: "雅集拍卖",
        },
      },
      {
        id: "lot-jade",
        lotNumber: "拍品 35",
        title: "青玉谷纹璧",
        artist: "战国",
        medium: "青玉",
        dimensions: "直径 18.6 cm",
        images: [
          {
            id: "jade-main",
            url: "/demo/jade-bi.png",
            width: 1448,
            height: 1086,
            alt: "青玉谷纹璧",
            focalPoint: { x: 0.5, y: 0.5 },
          },
        ],
      },
    ),
  },
  {
    id: "sale-results",
    updatedAt: "2026-07-20T18:22:00+08:00",
    status: "exported",
    progress: 100,
    project: projectWith(
      {
        projectName: "雅集拍卖 2026 春拍成交结果",
        templateId: "auction-result",
        aspectRatio: "16:9",
        cover: {
          id: "result-cover",
          url: "/demo/porcelain-vase.png",
          width: 1448,
          height: 1086,
          alt: "春拍成交结果封面",
          focalPoint: { x: 0.5, y: 0.5 },
        },
        auction: {
          title: "雅集拍卖 2026 春拍",
          subtitle: "重要拍品成交结果",
          date: "2026 年 7 月 20 日",
          location: "中国香港",
          houseName: "雅集拍卖",
        },
        lots: [
          lotWith("lot-result-porcelain", {
            lotNumber: "拍品 88",
            title: "青花缠枝花卉纹瓶",
            artist: "清代",
            estimateLow: 1800000,
            estimateHigh: 2400000,
            salePrice: 2860000,
            currency: "HKD",
            images: [
              {
                id: "result-porcelain-main",
                url: "/demo/porcelain-vase.png",
                width: 1448,
                height: 1086,
                alt: "青花瓷瓶成交拍品",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-result-scroll", {
            lotNumber: "拍品 101",
            title: "行书长卷",
            artist: "近现代",
            medium: "水墨纸本",
            dimensions: "32 × 268 cm",
            estimateLow: 900000,
            estimateHigh: 1400000,
            salePrice: 1680000,
            currency: "HKD",
            images: [
              {
                id: "result-scroll-main",
                url: "/demo/calligraphy-handscroll.png",
                width: 2700,
                height: 900,
                alt: "行书长卷成交拍品",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-result-hanging", {
            lotNumber: "拍品 126",
            title: "溪山清远图",
            artist: "佚名",
            medium: "水墨绢本",
            dimensions: "286 × 72 cm",
            estimateLow: 2200000,
            estimateHigh: 3200000,
            salePrice: 4120000,
            currency: "HKD",
            images: [
              {
                id: "result-hanging-main",
                url: "/demo/landscape-hanging-scroll.png",
                width: 900,
                height: 2700,
                alt: "溪山清远图成交拍品",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
        ],
      },
    ),
  },
  {
    id: "calligraphy-preview",
    updatedAt: "2026-07-19T15:47:00+08:00",
    status: "draft",
    progress: 42,
    project: projectWith(
      {
        projectName: "中国近现代书画专场预告",
        templateId: "auction-preview",
        aspectRatio: "16:9",
        themeId: "classic-light",
        cover: {
          id: "calligraphy-cover",
          url: "/demo/calligraphy-handscroll.png",
          width: 2700,
          height: 900,
          alt: "中国书画专场封面",
          focalPoint: { x: 0.5, y: 0.5 },
        },
        auction: {
          title: "中国近现代书画",
          subtitle: "秋季拍卖专场",
          date: "2026 年 9 月 28 日",
          location: "杭州",
          houseName: "雅集拍卖",
        },
        lots: [
          lotWith("lot-calligraphy", {
            lotNumber: "拍品 101",
            title: "行书长卷",
            artist: "近现代",
            medium: "水墨纸本",
            dimensions: "32 × 268 cm",
            images: [
              {
                id: "calligraphy-main",
                url: "/demo/calligraphy-handscroll.png",
                width: 2700,
                height: 900,
                alt: "行书长卷",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-hanging-scroll", {
            lotNumber: "拍品 126",
            title: "溪山清远图",
            artist: "佚名",
            medium: "水墨绢本",
            dimensions: "286 × 72 cm",
            images: [
              {
                id: "hanging-scroll-main",
                url: "/demo/landscape-hanging-scroll.png",
                width: 900,
                height: 2700,
                alt: "溪山清远图立轴",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
          lotWith("lot-jade-calligraphy", {
            lotNumber: "拍品 135",
            title: "青玉谷纹璧",
            artist: "战国",
            medium: "青玉",
            dimensions: "直径 18.6 cm",
            images: [
              {
                id: "jade-calligraphy-main",
                url: "/demo/jade-bi.png",
                width: 1448,
                height: 1086,
                alt: "青玉谷纹璧",
                focalPoint: { x: 0.5, y: 0.5 },
              },
            ],
          }),
        ],
      },
    ),
  },
];
