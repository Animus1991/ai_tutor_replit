import OpenAI from "openai";

/**
 * Lazy OpenAI client.
 *
 * Top-level `throw` was breaking the entire app when running in mock/dev
 * modes (where AI is never actually called). We now defer the env check
 * until the first method is invoked. If the env vars are missing or are
 * placeholders, that single call throws — boot and unrelated routes are
 * unaffected.
 *
 * For pure mock/test runs, set `AI_MOCK_RESPONSES=true` so the api-server
 * never reaches into this client at all.
 */

const PLACEHOLDER = /REPLACE_ME|^sk-\.\.\.$/i;

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Set it in .env (defaults to https://api.openai.com/v1) or enable AI_MOCK_RESPONSES=true for local development.",
    );
  }
  if (!apiKey || PLACEHOLDER.test(apiKey)) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY is missing or a placeholder. Paste a real key in .env, or enable AI_MOCK_RESPONSES=true for local development.",
    );
  }

  cachedClient = new OpenAI({ apiKey, baseURL });
  return cachedClient;
}

/**
 * Proxy that defers OpenAI instantiation until first use.
 * `openai.chat.completions.create(...)` works just like a real OpenAI client.
 */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getClient();
    return Reflect.get(client, prop, receiver);
  },
});
