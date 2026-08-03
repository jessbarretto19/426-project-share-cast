const express = require("express");
const os = require("os");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT || 3000;
const instanceId = process.env.INSTANCE_ID || os.hostname();

// Cache entries expire quickly on purpose: with only a handful of catalog
// items, a short TTL keeps repeated lookups mostly cache hits while still
// forcing periodic misses, so a load test never sees a flat 0%/100% rate.
const CACHE_TTL_SECONDS = 2;

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";
const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => {
  console.error(JSON.stringify({ service: "catalog-service", instanceId, error: `redis: ${err.message}` }));
});

let redisReady = false;
redisClient
  .connect()
  .then(() => {
    redisReady = true;
    console.log(JSON.stringify({ service: "catalog-service", instanceId, message: "connected to redis" }));
  })
  .catch((err) => {
    console.error(JSON.stringify({ service: "catalog-service", instanceId, error: `redis connect failed: ${err.message}` }));
  });

const inventory = [
  {
    itemId: "COST-014",
    name: "Victorian Tailcoat",
    category: "costume",
    size: "M",
    condition: "good",
    ownerOrg: "UMass Theatre Department",
    location: "Amherst, MA",
    quantityAvailable: 2
  },
  {
    itemId: "LX-220",
    name: "ETC Source Four Ellipsoidal",
    category: "lighting",
    condition: "excellent",
    ownerOrg: "Theatrix",
    location: "Belchertown, MA",
    quantityAvailable: 10
  },
  {
    itemId: "SET-031",
    name: "7-11 Cart (Heathers the Musical)",
    category: "set-piece",
    condition: "fair",
    ownerOrg: "UMass Theatre Guild",
    location: "Amherst, MA",
    quantityAvailable: 1
  }
];

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "catalog-service", instanceId });
});

app.get("/items", (_req, res) => {
  // Simulates catalog query latency from a backing store.
  setTimeout(() => {
    res.json({
      generatedAt: new Date().toISOString(),
      totalItems: inventory.length,
      instanceId,
      items: inventory
    });
  }, 650);
});

app.get("/items/:itemId", async (req, res) => {
  const itemId = req.params.itemId.toUpperCase();
  const cacheKey = `item:${itemId}`;

  if (redisReady) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        console.log(JSON.stringify({ service: "catalog-service", instanceId, itemId, cache: "HIT" }));
        return res.json({ ...JSON.parse(cached), instanceId, cache: "HIT" });
      }
    } catch (err) {
      console.error(JSON.stringify({ service: "catalog-service", instanceId, error: `redis get failed: ${err.message}` }));
    }
  }

  const item = inventory.find((entry) => entry.itemId === itemId);

  // Simulates the latency of fetching from a backing store on a cache miss.
  setTimeout(async () => {
    console.log(JSON.stringify({ service: "catalog-service", instanceId, itemId, cache: "MISS" }));

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
        itemId: req.params.itemId,
        instanceId,
        cache: "MISS"
      });
    }

    if (redisReady) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(item), { EX: CACHE_TTL_SECONDS });
      } catch (err) {
        console.error(JSON.stringify({ service: "catalog-service", instanceId, error: `redis set failed: ${err.message}` }));
      }
    }

    return res.json({ ...item, instanceId, cache: "MISS" });
  }, 250);
});

app.listen(port, () => {
  console.log(`catalog-service (${instanceId}) listening on port ${port}`);
});
