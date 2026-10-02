import type {
  ProcessedRelease,
  ReleaseRequest,
  SubscriberUpdate
} from "./release_contract.js";

export function eligibleSubscribers(release: ReleaseRequest) {
  if (release.assetKind === "video-course") {
    return release.subscribers.filter((subscriber) => subscriber.tier === "studio");
  }

  return release.subscribers.filter((subscriber) => subscriber.tier !== "free");
}

export function buildSubscriberUpdates(
  release: ReleaseRequest,
  processed: ProcessedRelease
): SubscriberUpdate[] {
  return eligibleSubscribers(release).map((subscriber) => ({
    subscriberId: subscriber.id,
    subject: processed.headline,
    body: [
      `Hi ${subscriber.displayName},`,
      processed.summary,
      processed.deliveryNote,
      `Download: ${release.downloadUrl}`
    ].join("\n\n")
  }));
}

export function contentPrompt(release: ReleaseRequest): string {
  return [
    "Prepare a subscriber update for a creator's digital release.",
    `Creator: ${release.creatorName}`,
    `Asset: ${release.assetTitle} (${release.assetKind})`,
    `Release notes: ${release.releaseNotes}`,
    "Return JSON with headline, summary, and deliveryNote.",
    "The deliveryNote must tell an eligible subscriber that their download is ready.",
    "Do not put a URL in the JSON; the service attaches the delivery link."
  ].join("\n");
}
