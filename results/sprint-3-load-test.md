# Sprint 3 Load Test Summary

**Target:** `GET /items/:itemId` on `catalog-service`, accessed through the Caddy
load balancer at `http://localhost:8090` fronting three replicas
(`catalog-service-1/2/3`), with Redis caching (2s TTL) on the item-lookup path.

**Test config:** `load-tests/sprint-3-load.js`, k6 v2.1.0, ramp 5s → 15 VUs,
hold 30s, ramp down 5s (40s total), random selection across the 3 catalog
items with 0.5s think time between iterations.

## Results

| Metric | Value |
|---|---|
| Requests | 990 (24.5 req/s) |
| p50 latency | 2.95 ms |
| p95 latency | 254.24 ms |
| p99 latency | 255.57 ms |
| Max latency | 286.95 ms |
| Error rate | 0.00% (0 / 990 failed) |
| Cache hit rate | 86.8% (859 hits / 131 misses) |

Requests were confirmed to round-robin across `catalog-1`, `catalog-2`, and
`catalog-3` (verified via the `instanceId` field Caddy-proxied responses
include), and stopping one replica mid-run left the other two serving traffic
with no failed requests, confirming Caddy's health-checked load balancing
works as intended.

## Comparison against `docs/SLO.md`

catalog-service's SLOs are **300 ms p95 latency** and **99.9% success rate**.

- **Latency: met.** p95 (254 ms) and p99 (256 ms) both land under the 300 ms
  target, with headroom of roughly 45 ms.
- **Reliability: met, with margin.** 0% error rate is well above the 99.9%
  success target.

(This test only exercised the catalog-service path; `reservation-service`'s
SLOs were not evaluated in this run.)

## Interpretation

The latency distribution is bimodal: cache hits resolve in a few milliseconds
(median 2.95 ms), while cache misses pay the full simulated 250 ms
backing-store fetch. Because misses make up about 13% of requests, they are
exactly what dominates the p95/p99 tail — the tail latency is essentially
"the cost of a cache miss," not queuing or contention. With only 15 VUs and a
0.5s think time per iteration, the system is nowhere near saturated (throughput
was capped by the test's pacing, not the server), so this run establishes a
correctness/latency baseline rather than a peak-load ceiling.

The main bottleneck for tail latency is the fixed 250 ms miss penalty on the
catalog lookup. If p95 needed to come down further, the options are: increase
the cache TTL (trades data freshness for fewer misses), pre-warm/refresh hot
keys in the background instead of on-demand, or reduce the simulated
backing-store latency. For Sprint 5, we plan to push a true throughput test
(higher VU count, no artificial think time) to find the actual saturation
point now that async processing and resilience patterns will be layered in,
and compare that against this baseline.
