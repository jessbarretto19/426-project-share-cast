const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

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
  res.status(200).json({ status: "ok", service: "catalog-service" });
});

app.get("/items", (_req, res) => {
  // Simulates catalog query latency from a backing store.
  setTimeout(() => {
    res.json({
      generatedAt: new Date().toISOString(),
      totalItems: inventory.length,
      items: inventory
    });
  }, 650);
});

app.get("/items/:itemId", (req, res) => {
  const item = inventory.find((entry) => entry.itemId === req.params.itemId.toUpperCase());

  setTimeout(() => {
    if (!item) {
      return res.status(404).json({
        error: "Item not found",
        itemId: req.params.itemId
      });
    }

    return res.json(item);
  }, 250);
});

app.listen(port, () => {
  console.log(`catalog-service listening on port ${port}`);
});
