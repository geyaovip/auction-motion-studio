import type { ProjectInput } from "@/src/types/project";

export const demoProject: ProjectInput = {
  projectName: "Botanical Masters · Hong Kong",
  templateId: "artwork-showcase",
  aspectRatio: "9:16",
  themeId: "classic-dark",
  auction: {
    title: "Botanical Masters",
    subtitle: "An Evening Sale",
    date: "18 September 2026",
    location: "Hong Kong",
    houseName: "Atelier Auctions",
    website: "atelier-auctions.com",
  },
  lots: [
    {
      id: "lot-001",
      lotNumber: "Lot 18",
      artist: "Demonstration Artist",
      title: "Floral Study No. 7",
      year: "2026",
      medium: "Oil and mixed media on canvas",
      dimensions: "130.3 × 162 cm",
      estimateLow: 800000,
      estimateHigh: 1200000,
      salePrice: 1450000,
      currency: "USD",
      captions: ["Detail of layered pigments and floral forms"],
      images: [
        {
          id: "artwork-main",
          url: "/demo/artwork-main.jpg",
          width: 1600,
          height: 2089,
          alt: "Floral artwork demonstration image",
          focalPoint: { x: 0.5, y: 0.47 },
        },
        {
          id: "artwork-detail",
          url: "/demo/artwork-detail.jpg",
          width: 1600,
          height: 2400,
          alt: "Abstract detail demonstration image",
          focalPoint: { x: 0.56, y: 0.45 },
        },
      ],
    },
  ],
};
