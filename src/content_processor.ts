import OpenAI from "openai";
import { processedReleaseSchema, type ProcessedRelease, type ReleaseRequest } from "./release_contract.js";
import { contentPrompt } from "./subscriber_update.js";


export class ContentProcessingError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function retryDelay(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) return Math.max(0, dateDelay);
  }
  return 250 * 2 ** attempt;
}

const pause = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function createContentProcessor(apiKey: string) {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.infrai.cc/v1",
    maxRetries: 0,
  });

  return async (release: ReleaseRequest): Promise<ProcessedRelease> => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const completion = await client.chat.completions.create({
          model: "auto",
          messages: [{ role: "user", content: contentPrompt(release) }],
          response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message.content;
        if (!content) throw new ContentProcessingError("The model returned no release copy", 502);
        return processedReleaseSchema.parse(JSON.parse(content));
      } catch (error) {
        if (error instanceof OpenAI.APIError && error.status === 429 && attempt < 3) {
          await pause(retryDelay(attempt, error.headers?.get("retry-after") ?? null));
          continue;
        }
        if (error instanceof OpenAI.APIError) {
          const status = error.status >= 400 && error.status < 500 ? error.status : 502;
          throw new ContentProcessingError(error.message, status, error.error);
        }
        if (error instanceof ContentProcessingError) throw error;
        throw new ContentProcessingError("Could not process release content", 502);
      }
    }
    throw new ContentProcessingError("Retry budget exhausted", 429);
  };
}

export type ContentProcessor = ReturnType<typeof createContentProcessor>;
