const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const reservations = [
  {
    reservationId: "RSV-9001",
    itemId: "COST-014",
    itemName: "Victorian Tailcoat",
    borrowerOrg: "UMass Theatre Guild",
    reservedFrom: "2026-08-10",
    reservedTo: "2026-08-20",
    status: "confirmed"
  },
  {
    reservationId: "RSV-9002",
    itemId: "LX-220",
    itemName: "ETC Source Four Ellipsoidal",
    borrowerOrg: "Amherst Repertory Company",
    reservedFrom: "2026-08-18",
    reservedTo: "2026-08-22",
    status: "pending-pickup"
  }
];

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "reservation-service" });
});

app.get("/reservations", (_req, res) => {
  // Simulates reservation-store lookup time.
  setTimeout(() => {
    res.json({
      generatedAt: new Date().toISOString(),
      activeReservations: reservations.length,
      reservations
    });
  }, 450);
});

app.post("/reservations", (req, res) => {
  const { itemId, itemName, borrowerOrg, reservedFrom, reservedTo } = req.body;

  if (!itemId || !itemName || !borrowerOrg || !reservedFrom || !reservedTo) {
    return res.status(400).json({
      error: "Missing required reservation fields",
      required: ["itemId", "itemName", "borrowerOrg", "reservedFrom", "reservedTo"]
    });
  }

  const reservationId = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;
  const newReservation = {
    reservationId,
    itemId,
    itemName,
    borrowerOrg,
    reservedFrom,
    reservedTo,
    status: "confirmed"
  };

  // Simulates transactional write latency.
  setTimeout(() => {
    reservations.push(newReservation);
    res.status(201).json({
      message: "Reservation created",
      reservation: newReservation
    });
  }, 900);
});

app.listen(port, () => {
  console.log(`reservation-service listening on port ${port}`);
});
