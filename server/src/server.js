import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database.js";
import geofenceRoutes from "./routes/geofenceRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";

const app = express();

app.set("trust proxy", true);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.use("/api/geofence", geofenceRoutes);
app.use("/api/candidates", candidateRoutes);

const port = process.env.PORT || 3001;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `GeoGate API running at http://localhost:${port}`
      );
    });
  })
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });