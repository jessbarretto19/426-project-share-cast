# Service Level Objectives

## catalog-service

**Latency SLO:** Catalog search requests should respond within **300 ms at the 95th percentile** so that users can quickly browse available costumes and props while planning productions.

**Reliability SLO:** Catalog lookup requests should succeed at least **99.9%** of the time. Occasional failed searches are inconvenient but do not risk incorrect inventory data.

## reservation-service

**Latency SLO:** Reservation requests should complete within **500 ms at the 95th percentile** so users receive prompt confirmation that an item has been reserved.

**Reliability SLO:** Reservation requests should succeed at least **99.99%** of the time. Reservations should use **at-most-once semantics** to ensure duplicate requests cannot create multiple reservations for the same item, preserving inventory accuracy.
