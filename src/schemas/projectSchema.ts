import { z } from "zod";

const currencySchema = z.enum(["USD", "GBP", "EUR", "HKD", "CNY", "SGD"]);

export const focalPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const assetSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  alt: z.string().optional(),
  focalPoint: focalPointSchema.optional(),
});

export const lotSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    artist: z.string().optional(),
    year: z.string().optional(),
    medium: z.string().optional(),
    dimensions: z.string().optional(),
    estimateLow: z.number().nonnegative().optional(),
    estimateHigh: z.number().nonnegative().optional(),
    currency: currencySchema.optional(),
    lotNumber: z.string().optional(),
    salePrice: z.number().nonnegative().optional(),
    images: z.array(assetSchema).min(1),
    captions: z.array(z.string()).optional(),
  })
  .superRefine((lot, context) => {
    const hasEstimate =
      lot.estimateLow !== undefined || lot.estimateHigh !== undefined;
    if (hasEstimate && lot.currency === undefined) {
      context.addIssue({
        code: "custom",
        message: "填写估价时必须选择币种",
        path: ["currency"],
      });
    }
    if (
      lot.estimateLow !== undefined &&
      lot.estimateHigh !== undefined &&
      lot.estimateLow > lot.estimateHigh
    ) {
      context.addIssue({
        code: "custom",
        message: "最低估价不能高于最高估价",
        path: ["estimateHigh"],
      });
    }
  });

export const projectSchema = z
  .object({
    projectName: z.string().min(1),
    templateId: z.enum([
      "artwork-showcase",
      "auction-preview",
      "auction-result",
    ]),
    aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
    themeId: z.enum(["classic-light", "classic-dark"]),
    cover: assetSchema.optional(),
    logo: assetSchema.optional(),
    lots: z.array(lotSchema).min(1),
    auction: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        date: z.string().optional(),
        location: z.string().optional(),
        houseName: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((project, context) => {
    if (
      project.templateId === "auction-result" &&
      project.lots.every((lot) => lot.salePrice === undefined)
    ) {
      context.addIssue({
        code: "custom",
        message: "成交结果模板至少需要一件拍品填写成交价",
        path: ["lots"],
      });
    }
  });

export type ProjectSchema = z.infer<typeof projectSchema>;
