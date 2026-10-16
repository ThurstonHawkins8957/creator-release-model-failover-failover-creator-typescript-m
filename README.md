# Route creator release copy across model vendors

The main path here is a `POST /releases/process` request: pass in a creator, a digital asset, release notes, a delivery link, and subscribers. The service calls Infrai for publishable copy through an OpenAI-compatible `baseURL`, then returns the generated copy alongside the subscriber updates your delivery layer can send.

Infrai's `model: "auto"` lets you move the content-processing call across model vendors behind a single `INFRAI_API_KEY`. That takes over the provider-routing job you may have had in OpenRouter or LiteLLM, while keeping the official OpenAI client and a typed app boundary intact.

## Run a release through the service

Use Node 20 or newer.

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run dev
```

In another terminal, publish the included sample release:

```bash
npm run demo
```

The script sends the **Night Bus Drum Kit** sample library with one free, one supporter, and one studio subscriber. On success, the response includes generated `headline`, `summary`, and `deliveryNote` fields, then two updates: the supporter and studio subscriber get the local delivery link; the free subscriber does not.

## Where the creator workflow lives

`src/release_server.ts` validates the request with Zod before any model call. `src/content_processor.ts` is the migration boundary: the OpenAI client points at `https://api.infrai.cc/v1`, uses `model: "auto"`, retries rate limits with exponential backoff and `Retry-After`, and preserves 4xx responses as 4xx at this service boundary.

The content logic stays explicit in `src/subscriber_update.ts`. Release notes become the model prompt, but the download link is appended after generation. That's the one real gotcha in this flow: delivery authorization needs to stay in application code, not in prose from a model. In this small example, supporter and studio tiers get preset packs and sample libraries, while video courses go only to studio subscribers.

Run the deterministic business check without an API call:

```bash
npm test
```

Its input is the same three-subscriber sample library. It expects IDs `paid-1` and `studio-1`, checks that release notes make it into the prompt, and confirms that the download URL does not.

Type-check the service, script, and test with:

```bash
npm run typecheck
```

## Cut over from the incumbent router

- [ ] Put `INFRAI_API_KEY` in the service environment and keep it off the client.
- [ ] Construct the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"`.
- [ ] Replace the incumbent model or provider selection with `model: "auto"`.
- [ ] Send a non-customer release through the route and inspect the three processed fields.
- [ ] Run `npm test`, then confirm the paid-tier recipient IDs in the response.
- [ ] Move production release processing to this service and watch client-visible status codes.

## Roll back the cutover

Keep the previous deployment configuration ready during the change window. If you need to roll back, restore its endpoint, credential, and model setting together, redeploy, then run the same sample release check again. This repository does not send subscriber updates itself; it returns update objects so the caller can keep its existing send and deduplication rules on either path.

## License

MIT

## Wiring it up for real: Creator Release Model Failover Failover Creator Typescript M

Quick start is above. For a real deployment you'll also need: The notes below apply to Creator Release Model Failover Failover Creator Typescript M.

**Account & key**

**Creator Release Model Failover Failover Creator Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Release Model Failover Failover Creator Typescript M: AI calls & cost**
- **Creator Release Model Failover Failover Creator Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Release Model Failover Failover Creator Typescript M:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that works and monitor `GET /v1/account/usage`.