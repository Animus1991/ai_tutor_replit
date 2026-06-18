export interface FeynmanCheckResult {
  score: number;
  issues: string[];
  isDemo?: boolean;
}

export async function postFeynmanCheck(body: {
  explanation: string;
  concept?: string;
}): Promise<FeynmanCheckResult> {
  const res = await fetch("/api/openai/feynman-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Feynman check failed");
  }
  return res.json() as Promise<FeynmanCheckResult>;
}
