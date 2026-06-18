import { Buffer } from "node:buffer";
import fs from "node:fs";
import OpenAI, { toFile } from "openai";

const PLACEHOLDER = /REPLACE_ME|^sk-\.\.\.$/i;

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseURL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL must be set for image generation. Set it in .env or enable AI_MOCK_RESPONSES=true.",
    );
  }
  if (!apiKey || PLACEHOLDER.test(apiKey)) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY is missing or a placeholder. Paste a real key in .env, or enable AI_MOCK_RESPONSES=true.",
    );
  }

  cachedClient = new OpenAI({ apiKey, baseURL });
  return cachedClient;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    const client = getClient();
    return Reflect.get(client, prop, receiver);
  },
});

export async function generateImageBuffer(
  prompt: string,
  size:
    | "1024x1024"
    | "1536x1024"
    | "1024x1536"
    | "512x512"
    | "256x256" = "1024x1024",
): Promise<Buffer> {
  const response = await getClient().images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const base64 = response.data?.[0]?.b64_json ?? "";
  return Buffer.from(base64, "base64");
}

export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string,
): Promise<Buffer> {
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      }),
    ),
  );

  const response = await getClient().images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const imageBase64 = response.data?.[0]?.b64_json ?? "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}
