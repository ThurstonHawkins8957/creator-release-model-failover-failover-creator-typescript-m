import assert from "node:assert/strict";
import test from "node:test";
import { releaseRequestSchema } from "../src/release_contract.js";
import { buildSubscriberUpdates, contentPrompt } from "../src/subscriber_update.js";

test("a sample library is delivered to paid subscribers with its link attached locally", () => {
  const release = releaseRequestSchema.parse({
    creatorName: "Mina Loops",
    assetTitle: "Night Bus Drum Kit",
    assetKind: "sample-library",
    releaseNotes: "Twenty-four clipped percussion loops, normalized and tagged by tempo.",
    downloadUrl: "https://downloads.example.com/night-bus",
    subscribers: [
      { id: "free-1", displayName: "Ari", tier: "free" },
      { id: "paid-1", displayName: "Jo", tier: "supporter" },
      { id: "studio-1", displayName: "Ren", tier: "studio" }
    ]
  });

  const prompt = contentPrompt(release);
  const updates = buildSubscriberUpdates(release, {
    headline: "Night Bus is ready",
    summary: "A new percussion set just landed.",
    deliveryNote: "Your sample-library download is ready."
  });

  assert.match(prompt, /Twenty-four clipped percussion loops/);
  assert.doesNotMatch(prompt, /downloads\.example\.com/);
  assert.deepEqual(updates.map((update) => update.subscriberId), ["paid-1", "studio-1"]);
  assert.match(updates[0]!.body, /https:\/\/downloads\.example\.com\/night-bus/);
});
