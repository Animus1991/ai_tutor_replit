/**
 * S3-compatible object storage abstraction.
 *
 * Works with:
 * - MinIO (self-hosted, free, docker compose)
 * - AWS S3
 * - Cloudflare R2 (zero egress fees — recommended for production)
 * - Backblaze B2
 *
 * Configuration via env vars (see .env.example):
 *   STORAGE_ENDPOINT      e.g. http://localhost:9000 (MinIO) or
 *                         https://<account>.r2.cloudflarestorage.com
 *   STORAGE_REGION        e.g. us-east-1 (R2 always uses "auto")
 *   STORAGE_BUCKET        e.g. ai-tutor-uploads
 *   STORAGE_ACCESS_KEY    access key id
 *   STORAGE_SECRET_KEY    secret access key
 *   STORAGE_PUBLIC_URL    optional CDN/public URL prefix
 *   STORAGE_FORCE_PATH_STYLE  set "true" for MinIO (default false for AWS/R2)
 */

import crypto from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} environment variable is required for object storage`,
    );
  }
  return value;
}

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION ?? "auto",
    credentials: {
      accessKeyId: requireEnv("STORAGE_ACCESS_KEY"),
      secretAccessKey: requireEnv("STORAGE_SECRET_KEY"),
    },
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
  });
  return cachedClient;
}

function getBucket(): string {
  return requireEnv("STORAGE_BUCKET");
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export async function uploadObject(params: {
  body: Buffer | Uint8Array;
  contentType: string;
  prefix?: string;
  filename?: string;
}): Promise<UploadResult> {
  const { body, contentType, prefix = "uploads", filename } = params;
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const publicUrl = process.env.STORAGE_PUBLIC_URL;
  const url = publicUrl
    ? `${publicUrl.replace(/\/$/, "")}/${key}`
    : `${process.env.STORAGE_ENDPOINT?.replace(/\/$/, "")}/${getBucket()}/${key}`;

  return {
    key,
    url,
    size: body.byteLength,
    contentType,
  };
}

export async function downloadObject(key: string): Promise<Buffer> {
  const response = await getClient().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
  );
  if (!response.Body) {
    throw new Error(`Object ${key} not found`);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: getBucket(), Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a pre-signed URL for direct browser uploads (PUT) or downloads (GET).
 * Use for large files to bypass server bandwidth.
 */
export async function presignedUploadUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: params.key,
    ContentType: params.contentType,
  });
  return getSignedUrl(getClient(), command, {
    expiresIn: params.expiresIn ?? 3600,
  });
}

export async function presignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export function isStorageConfigured(): boolean {
  return (
    Boolean(process.env.STORAGE_ENDPOINT) &&
    Boolean(process.env.STORAGE_BUCKET) &&
    Boolean(process.env.STORAGE_ACCESS_KEY) &&
    Boolean(process.env.STORAGE_SECRET_KEY)
  );
}
