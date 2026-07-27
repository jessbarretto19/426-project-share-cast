const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;
const upstream = process.env.UPSTREAM_URL || "http://reservation-service:3000";

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "reservation-sidecar", upstream });
});

app.use((req, res, next) => {
  const startedAt = Date.now();
  resOnFinish(req, res, startedAt);
  next();
});

function resOnFinish(req, res, startedAt) {
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      JSON.stringify({
        sidecar: "reservation-sidecar",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        timestamp: new Date().toISOString()
      })
    );
  });
}

app.use(
  "/",
  createProxyMiddleware({
    target: upstream,
    changeOrigin: true,
    logLevel: "warn"
  })
);

app.listen(port, () => {
  console.log(`reservation-sidecar proxying to ${upstream} on port ${port}`);
});
