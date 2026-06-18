import {
  resolveClerkSecretKey,
  shouldBypassClerk,
} from "@workspace/clerk-config";
import app from "./app";
import { getAuthProvider } from "./lib/auth";
import { logger } from "./lib/logger";

const bypass = shouldBypassClerk(
  "localhost",
  process.env.CLERK_PUBLISHABLE_KEY,
  process.env.DEV_AUTH_BYPASS,
);

if (getAuthProvider() === "clerk" && !bypass) {
  resolveClerkSecretKey(process.env.CLERK_SECRET_KEY);
}

const rawPort = process.env.PORT ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info(
    { port, authProvider: getAuthProvider() },
    `Server listening on :${port} (auth: ${getAuthProvider()})`,
  );
});
