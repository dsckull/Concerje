import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ─── Serve Frontend Static Files (Production) ───────────────────────────
// In production (Railway), Frontend is compiled to /public
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir, {
  maxAge: "1d",
  etag: false,
  setHeaders: (res, filePath) => {
    // Cache busting: Set no-cache for HTML, long cache for static assets
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    }
  },
}));

// ─── SPA Fallback (All non-API routes serve index.html) ──────────────────
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    res.sendFile(path.join(publicDir, "index.html"));
  } else {
    next();
  }
});

export default app;
