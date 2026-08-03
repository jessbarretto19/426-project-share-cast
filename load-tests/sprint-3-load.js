import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

// Sprint 3 baseline load test: exercises the replicated + Redis-cached
// catalog-service item lookup endpoint through the Caddy load balancer.
// Run with: k6 run load-tests/sprint-3-load.js

const BASE_URL = __ENV.BASE_URL || "http://localhost:8090";

// Only 3 items exist in the catalog, and cache entries expire after 8s
// (see catalog-service/src/index.js), so repeated lookups across this
// item pool naturally produce a realistic mix of cache hits and misses
// instead of a flat 0%/100% rate.
const ITEM_IDS = ["COST-014", "LX-220", "SET-031"];

export const cacheHits = new Counter("cache_hits");
export const cacheMisses = new Counter("cache_misses");

export const options = {
  stages: [
    { duration: "5s", target: 15 }, // ramp up
    { duration: "30s", target: 15 }, // sustained load
    { duration: "5s", target: 0 } // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"]
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(50)", "p(90)", "p(95)", "p(99)"]
};

export default function () {
  const itemId = ITEM_IDS[Math.floor(Math.random() * ITEM_IDS.length)];
  const res = http.get(`${BASE_URL}/items/${itemId}`);

  check(res, {
    "status is 200": (r) => r.status === 200
  });

  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      if (body.cache === "HIT") {
        cacheHits.add(1);
      } else if (body.cache === "MISS") {
        cacheMisses.add(1);
      }
    } catch (_err) {
      // ignore parse failures, they will already surface as failed checks
    }
  }

  sleep(0.5);
}
