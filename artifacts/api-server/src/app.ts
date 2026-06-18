import cors from "cors";
import express, { type Express } from "express";
import pinoHttp from "pino-http";
import { getAuthProvider, installAuth } from "./lib/auth";
import { logger } from "./lib/logger";
import router from "./routes";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

installAuth(app);

if (getAuthProvider() === "bypass") {
  logger.warn(
    "Auth provider is BYPASS — every request is treated as the mock dev user (dev-user-local). Do NOT use this in production.",
  );
}

app.use("/api", router);

export default app;
