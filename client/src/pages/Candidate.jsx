
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  LocateFixed,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

const VERIFICATION_CHECKS = [
  { id: 1, title: "Job country mismatch" },
  { id: 2, title: "Suspicious IP activity" },
  { id: 3, title: "VPN detected" },
  { id: 4, title: "Residential proxy detected" },
  { id: 5, title: "Public proxy detected" }
];

async function checkCandidateNetwork() {
  const response = await fetch("https://iplogs.com/v1/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      user_agent: navigator.userAgent
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "IPLogs network verification failed."
    );
  }

  if (!data.ip_info?.ip) {
    throw new Error("IPLogs did not return the candidate IP address.");
  }

  return data;
}

export default function Candidate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [centre, setCentre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCentre();
  }, []);

  async function loadCentre() {
    setLoading(true);
    setError("");

    try {
      setCentre(await api.getGeofence());
    } catch (e) {
      setCentre(null);
      setError(e.message || "Could not load test centre details.");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError("");
    setChecking(true);

    try {
      if (!navigator.geolocation) {
        throw new Error("Location services are not supported.");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      const networkCheck = await checkCandidateNetwork();

      const result = await api.verifyCandidate({
        candidateName: user.name,
        candidateId: user.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        networkCheck
      });

      navigate(`/result/${result.attemptId}`);
    } catch (e) {
      if (e.code === 1) {
        setError(
          "Location permission was denied. Please allow location access and try again."
        );
      } else if (e.code === 2) {
        setError(
          "Your location could not be determined. Please try again."
        );
      } else if (e.code === 3) {
        setError(
          "Location request timed out. Please try again."
        );
      } else {
        setError(e.message || "Could not verify your location.");
      }
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="panel result-panel">
          Loading test centre details...
        </div>
      </AppLayout>
    );
  }

  if (!centre) {
    return (
      <AppLayout>
        <div className="page-heading">
          <div>
            <div className="eyebrow">CANDIDATE WORKSPACE</div>
            <h1>Location verification</h1>
            <p>Verify your location before taking the assessment.</p>
          </div>
        </div>

        <div className="panel">
          <p className="error-text">
            {error || "No test centre has been configured by the employer."}
          </p>
          <button
            className="button button-primary"
            onClick={loadCentre}
          >
            Refresh
          </button>
        </div>
      </AppLayout>
    );
  }

  const radiusKm = Number(centre.radiusMetres || 0) / 1000;

  const selectedFlags = Array.isArray(centre.checkFlags)
    ? centre.checkFlags.map(Number)
    : [1, 2, 3, 4, 5];

  const selectedChecks = VERIFICATION_CHECKS.filter(check =>
    selectedFlags.includes(check.id)
  );

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CANDIDATE WORKSPACE</div>
          <h1>Location verification</h1>
          <p>
            Complete the verification checks configured by your employer.
          </p>
        </div>

        <div className="heading-icon">
          <LocateFixed size={24} />
        </div>
      </div>

      <div className="candidate-layout">
        <section className="panel candidate-panel">
          <div className="point-icon">
            <MapPin size={20} />
          </div>

          <h2>Verify your location</h2>

          <p className="muted">
            GeoGate collects your GPS location and checks your browser's
            public network connection through IPLogs. The verification
            results are sent to the GeoGate backend.
          </p>

          <div className="centre-card">
            <div className="centre-card-icon">
              <MapPin size={18} />
            </div>

            <div>
              <b>{centre.centreName}</b>
              <p>{centre.address}</p>
              <small>
                Permitted radius: {radiusKm.toFixed(2)} km
              </small>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h3>Fraud checks required by your employer</h3>

            {selectedChecks.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  marginTop: "12px"
                }}
              >
                {selectedChecks.map(check => (
                  <div
                    key={check.id}
                    className="info-row"
                    style={{
                      justifyContent: "flex-start",
                      gap: "10px"
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {check.id}. {check.title}
                    </span>
                    <b style={{ marginLeft: "auto" }}>
                      Required
                    </b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="error-text">
                The employer has not selected any fraud checks.
                Please contact the employer.
              </p>
            )}
          </div>

          <div className="info-row" style={{ marginTop: "18px" }}>
            <MapPin size={16} />
            <span>GPS distance from test centre</span>
            <b>Always required</b>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="button button-primary button-wide verify-button"
            onClick={verify}
            disabled={checking || selectedChecks.length === 0}
          >
            <LocateFixed size={17} />
            {checking ? "Verifying..." : "Allow location and verify"}
          </button>

          <div className="permission-hint">
            <ShieldCheck size={13} />
            <span>
              GPS and network verification are required for assessment access.
            </span>
          </div>
        </section>

        <aside className="panel side-panel">
          <div className="side-icon">
            <ShieldCheck size={20} />
          </div>

          <h3>Verification process</h3>

          <p className="muted">
            Your browser provides GPS coordinates and sends a network
            verification request to IPLogs. GeoGate checks your GPS
            distance and the fraud checks selected by your employer.
          </p>

          <div className="r+++adius-preview">
            <span>Permitted distance</span>
            <strong>{radiusKm.toFixed(2)} km</strong>
            <small>
              Candidate must be within this radius.
            </small>
          </div>

          <div className="info-row">
            <CheckCircle2 size={14} />
            <span>Selected fraud checks</span>
            <b>{selectedChecks.length} of 5</b>
          </div>

          <div className="privacy-note">
            Your verification is processed by GeoGate for assessment
            access control.
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
;

