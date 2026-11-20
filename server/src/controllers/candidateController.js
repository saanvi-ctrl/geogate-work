
import Geofence from "../models/Geofence.js";
import VerificationAttempt from "../models/VerificationAttempt.js";

function distanceInMetres(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;
  const toRadians = value => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

const CHECK_NAMES = {
  1: "Job country mismatch",
  2: "Suspicious IP activity",
  3: "VPN detected",
  4: "Residential proxy detected",
  5: "Public proxy detected"
};

const SUSPICIOUS_IP_DATASET = new Set([
  "192.0.2.10",
  "192.0.2.20",
  "192.0.2.30",
  "192.0.2.40",
  "198.51.100.10",
  "198.51.100.20",
  "198.51.100.30",
  "198.51.100.40",
  "203.0.113.10",
  "203.0.113.20",
  "203.0.113.30",
  "203.0.113.40"
]);

function normalizeCountry(value) {
  return String(value || "").trim().toUpperCase();
}

export async function verifyCandidate(req, res) {
  try {
    const {
      candidateName,
      candidateId,
      latitude,
      longitude,
      accuracy,
      networkCheck
    } = req.body || {};

    if (
      !candidateName ||
      !candidateId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Candidate details and GPS coordinates are required."
      });
    }

    const candidateLatitude = Number(latitude);
    const candidateLongitude = Number(longitude);

    if (
      !Number.isFinite(candidateLatitude) ||
      !Number.isFinite(candidateLongitude) ||
      candidateLatitude < -90 ||
      candidateLatitude > 90 ||
      candidateLongitude < -180 ||
      candidateLongitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid GPS coordinates."
      });
    }

    const geofence = await Geofence.findOne();

    if (!geofence) {
      return res.status(404).json({
        message: "No test centre has been configured."
      });
    }

    const distance = distanceInMetres(
      candidateLatitude,
      candidateLongitude,
      Number(geofence.latitude),
      Number(geofence.longitude)
    );

    const radiusMetres = Number(geofence.radiusMetres);

    const locationPassed =
      Number.isFinite(distance) &&
      Number.isFinite(radiusMetres) &&
      distance <= radiusMetres;

    const ipInfo = networkCheck?.ip_info || {};

    console.log(
      "IPLOGS NETWORK RESPONSE:",
      JSON.stringify(networkCheck, null, 2)
    );

    const publicIp = String(
      ipInfo.ip || networkCheck?.ip || ""
    ).trim();

    const networkCheckCompleted =
      Boolean(publicIp) && typeof networkCheck === "object";

    const jobCountry = normalizeCountry(geofence.jobCountry);

    const candidateCountry = normalizeCountry(
      networkCheck?.countryCode ||
      networkCheck?.country_code ||
      ipInfo.country_code
    );

    const vpnDetected =
      networkCheck?.vpnDetected === true ||
      networkCheck?.is_vpn === true ||
      ipInfo.is_vpn === true;

    const proxyDetected =
      networkCheck?.proxyDetected === true ||
      networkCheck?.is_proxy === true ||
      ipInfo.is_proxy === true;

    const proxyType = String(
      networkCheck?.proxyType ||
      networkCheck?.proxy_type ||
      ipInfo.proxy_type ||
      ipInfo.type ||
      ""
    ).trim().toLowerCase();

    const residentialProxyDetected =
      networkCheck?.residentialProxyDetected === true ||
      networkCheck?.is_residential_proxy === true ||
      ipInfo.is_residential_proxy === true;

    const publicProxyDetected =
      networkCheck?.publicProxyDetected === true ||
      networkCheck?.is_public_proxy === true ||
      ipInfo.is_public_proxy === true ||
      proxyType.includes("public") ||
      proxyType.includes("datacenter") ||
      proxyType.includes("hosting");

    const suspiciousIpDetected =
      SUSPICIOUS_IP_DATASET.has(publicIp);

    const signals = Array.isArray(networkCheck?.signals)
      ? networkCheck.signals
      : [];

    const selectedChecks = Array.isArray(geofence.checkFlags)
      ? geofence.checkFlags.map(Number)
      : [1, 2, 3, 4, 5];

    const checkPassed = {
      1:
        networkCheckCompleted &&
        Boolean(jobCountry) &&
        Boolean(candidateCountry) &&
        jobCountry === candidateCountry,

      2:
        networkCheckCompleted &&
        !suspiciousIpDetected,

      3:
        networkCheckCompleted &&
        !vpnDetected,

      4:
        networkCheckCompleted &&
        !residentialProxyDetected,

      5:
        networkCheckCompleted &&
        !publicProxyDetected
    };

    console.log("PROXY VERIFICATION:", {
      publicIp,
      vpnDetected,
      proxyDetected,
      proxyType,
      residentialProxyDetected,
      publicProxyDetected,
      candidateCountry,
      jobCountry
    });

    const checkResults = selectedChecks
      .filter(id => CHECK_NAMES[id])
      .map(id => ({
        checkId: id,
        name: CHECK_NAMES[id],
        passed: checkPassed[id] === true
      }));

    const allSelectedChecksPassed = checkResults.every(
      check => check.passed
    );

    const allowed = locationPassed && allSelectedChecksPassed;

    const attempt = await VerificationAttempt.create({
      candidateName: String(candidateName).trim(),
      candidateId: String(candidateId).trim(),

      latitude: candidateLatitude,
      longitude: candidateLongitude,
      accuracy: accuracy == null ? null : Number(accuracy),

      ipAddress: publicIp,

      jobCountry,
      candidateCountry,

      vpnDetected,
      proxyDetected,
      proxyType,
      residentialProxyDetected,
      publicProxyDetected,
      suspiciousIpDetected,

      hostingDetected:
        networkCheck?.is_hosting === true ||
        ipInfo.is_hosting === true,

      torDetected:
        networkCheck?.is_tor === true ||
        ipInfo.is_tor === true,

      relayDetected:
        networkCheck?.is_relay === true ||
        ipInfo.is_relay === true,

      networkScore: networkCheck?.score ?? null,
      networkVerdict: networkCheck?.verdict || "unknown",
      networkReputation: networkCheck?.reputation || "unknown",
      networkSignals: signals,

      vpnProvider:
        networkCheck?.vpnProvider ||
        ipInfo.vpn_provider ||
        "",

      networkCheckCompleted,
      networkCheckSource: "IPLogs browser",
      networkCheckMessage: networkCheckCompleted
        ? ""
        : "IPLogs did not return a candidate IP address.",

      locationSource: "GPS",
      locationCity: ipInfo.city || "",
      locationCountry: ipInfo.country || "",
      isp: ipInfo.isp || "",

      distanceMetres: Number.isFinite(distance) ? distance : 0,
      radiusMetres,
      locationPassed,

      checkFlags: selectedChecks,
      checkResults,
      passedChecks: checkResults.filter(check => check.passed).length,
      totalChecks: checkResults.length,

      allowed,
      authorized: false,

      centreName: geofence.centreName || "",
      address: geofence.address || ""
    });

    return res.status(201).json({
      message: allowed
        ? "Candidate passed verification."
        : "Candidate did not pass verification.",
      attemptId: attempt._id,
      attempt
    });
  } catch (error) {
    console.error("Candidate verification error:", error);

    return res.status(500).json({
      message: error.message || "Candidate verification failed."
    });
  }
}

export async function getAttempt(req, res) {
  try {
    const attempt = await VerificationAttempt.findById(
      req.params.attemptId
    );

    if (!attempt) {
      return res.status(404).json({
        message: "Verification attempt not found."
      });
    }

    return res.json({ attempt });
  } catch (error) {
    return res.status(500).json({
      message: "Could not retrieve verification result."
    });
  }
}

export async function authorizeAttempt(req, res) {
  try {
    const attempt = await VerificationAttempt.findById(
      req.params.attemptId
    );

    if (!attempt) {
      return res.status(404).json({
        message: "Verification attempt not found."
      });
    }

    if (!attempt.allowed) {
      return res.status(403).json({
        message: "Candidate has not passed verification."
      });
    }

    attempt.authorized = true;
    await attempt.save();

    return res.json({
      message: "Candidate is authorized to take the test.",
      attempt
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not authorize candidate."
    });
  }
}
