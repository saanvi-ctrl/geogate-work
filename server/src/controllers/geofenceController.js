import Geofence from "../models/Geofence.js";

const VALID_CHECKS = [1, 2, 3, 4, 5];

export async function getGeofence(req, res) {
  try {
    const geofence = await Geofence.findOne().sort({
      updatedAt: -1
    });

    if (!geofence) {
      return res.status(404).json({
        message: "The employer has not configured a test centre yet."
      });
    }

    return res.json(geofence);
  } catch (error) {
    console.error("Get geofence error:", error);

    return res.status(500).json({
      message: "Could not load the test centre."
    });
  }
}

export async function saveGeofence(req, res) {
  try {
    const {
      centreName,
      address,
      latitude,
      longitude,
      radiusMetres,
      jobCountry,
      checkFlags
    } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusMetres);
    const country = String(jobCountry || "").trim().toUpperCase();

    if (
      !String(centreName || "").trim() ||
      !String(address || "").trim()
    ) {
      return res.status(400).json({
        message: "Enter the centre name and address."
      });
    }

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Enter valid latitude and longitude coordinates."
      });
    }

    if (
      !Number.isFinite(radius) ||
      radius <= 0 ||
      radius > 1000000
    ) {
      return res.status(400).json({
        message: "Radius must be greater than 0 km and no more than 1000 km."
      });
    }

    let selectedChecks = [];

    if (Array.isArray(checkFlags)) {
      selectedChecks = checkFlags
        .map(Number)
        .filter(number => VALID_CHECKS.includes(number));
    }

    selectedChecks = [...new Set(selectedChecks)];

    if (selectedChecks.length === 0) {
      return res.status(400).json({
        message: "Select at least one fraud verification check."
      });
    }

    if (selectedChecks.includes(1) && !/^[A-Z]{2}$/.test(country)) {
      return res.status(400).json({
        message: "Enter a valid two-letter job country code, such as IN or GB."
      });
    }

    let geofence = await Geofence.findOne();

    const values = {
      centreName: centreName.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      radiusMetres: radius,
      jobCountry: country,
      checkFlags: selectedChecks,
      updatedAt: new Date()
    };

    if (geofence) {
      Object.assign(geofence, values);
      await geofence.save();
    } else {
      geofence = await Geofence.create(values);
    }

    return res.json({
      message: "Test centre and verification settings saved successfully.",
      geofence
    });
  } catch (error) {
    console.error("Save geofence error:", error);

    return res.status(500).json({
      message: "Could not save the test centre."
    });
  }
}