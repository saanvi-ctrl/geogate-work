import { Router } from "express";
import { getGeofence, saveGeofence } from "../controllers/geofenceController.js";

const router = Router();
router.get("/", getGeofence);
router.put("/", saveGeofence);
export default router;
