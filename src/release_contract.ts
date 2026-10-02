import { z } from "zod";

export const releaseRequestSchema = z.object({
  creatorName: z.string().trim().min(1),
  assetTitle: z.string().trim().min(1),
  assetKind: z.enum(["preset-pack", "sample-library", "video-course"]),
  releaseNotes: z.string().trim().min(10).max(4000),
  downloadUrl: z.string().url(),
  subscribers: z.array(z.object({
    id: z.string().trim().min(1),
    displayName: z.string().trim().min(1),
    tier: z.enum(["free", "supporter", "studio"])
  })).min(1)
});

export const processedReleaseSchema = z.object({
  headline: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  deliveryNote: z.string().trim().min(1)
});

export type ReleaseRequest = z.infer<typeof releaseRequestSchema>;
export type ProcessedRelease = z.infer<typeof processedReleaseSchema>;

export type SubscriberUpdate = {
  subscriberId: string;
  subject: string;
  body: string;
};
