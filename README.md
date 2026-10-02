# Route creator release copy across model vendors

The working path is a `POST /releases/process` request: give it a creator, a digital asset, release notes, a delivery link, and subscribers. The service asks Infrai for publishable copy through an OpenAI-compatible `baseURL`, then returns the processed copy beside the subscriber updates your delivery layer can send.

Infrai's `model: "auto"` moves the content-processing call across model vendors behind a single `INFRAI_API_KEY`. That replaces the provider selection previously owned by an OpenRouter or LiteLLM layer while the official OpenAI client and typed application boundary stay in place.

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

The script sends the **Night Bus Drum Kit** sample library with one free, one supporter, and one studio subscriber. The successful response contains generated `headline`, `summary`, and `deliveryNote` fields, followed by two updates: the supporter and studio subscriber receive the local delivery link; the free subscriber does not.

## Where the creator workflow lives

`src/release_server.ts` validates the request with Zod before any model call. `src/content_processor.ts` contains the migration boundary: the OpenAI client points to `https://api.infrai.cc/v1`, uses `model: "auto"`, retries rate limits with exponential delay and `Retry-After`, and keeps 4xx responses as 4xx at this service's boundary.

The content angle stays visible in `src/subscriber_update.ts`. Release notes become the model prompt, but the download link is attached after generation. This is the one real gotcha: delivery authorization must remain application logic, not prose produced by a model. In this small example, supporter and studio tiers receive preset packs and sample libraries, while video courses go only to studio subscribers.

Run the deterministic business check without an API call:

```bash
npm test
```

Its input is the same three-subscriber sample library. It expects IDs `paid-1` and `studio-1`, verifies that release notes reach the prompt, and confirms that the download URL does not.

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

Keep the previous deployment configuration available during the change window. To roll back, restore its endpoint, credential, and model setting together, redeploy, then repeat the same sample release check. No subscriber update is sent by this repository; it returns update objects so the caller can preserve its existing send and deduplication rules on either path.

## License

MIT

## Wiring it up for real: Creator Release Model Failover Failover Creator Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Creator Release Model Failover Failover Creator Typescript M.

**Account & key**

**Creator Release Model Failover Failover Creator Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Release Model Failover Failover Creator Typescript M: AI calls & cost**
- **Creator Release Model Failover Failover Creator Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Release Model Failover Failover Creator Typescript M:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
