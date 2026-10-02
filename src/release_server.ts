import { createServer, type ServerResponse } from "node:http";
import { ZodError } from "zod";
import { ContentProcessingError, createContentProcessor } from "./content_processor.js";
import { releaseRequestSchema } from "./release_contract.js";
import { buildSubscriberUpdates } from "./subscriber_update.js";

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJson(request: AsyncIterable<Buffer | string>) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 64 * 1024) throw new ContentProcessingError("Request body is too large", 413);
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the release service");
const processContent = createContentProcessor(apiKey);

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/releases/process") {
    json(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const release = releaseRequestSchema.parse(await readJson(request));
    const processed = await processContent(release);
    json(response, 200, {
      assetTitle: release.assetTitle,
      processed,
      subscriberUpdates: buildSubscriberUpdates(release, processed)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      json(response, 400, { error: "Invalid release", issues: error.issues });
      return;
    }
    if (error instanceof SyntaxError) {
      json(response, 400, { error: "Request body must be valid JSON" });
      return;
    }
    if (error instanceof ContentProcessingError) {
      json(response, error.status, { error: error.message, details: error.details });
      return;
    }
    json(response, 500, { error: "Unexpected service error" });
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Release service listening on http://localhost:${port}`));
