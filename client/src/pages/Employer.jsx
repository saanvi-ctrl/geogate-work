import { useEffect, useState } from "react";
import {
  Crosshair,
  MapPin,
  Save,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import AppLayout from "../components/AppLayout.jsx";
import { api } from "../services/api.js";
import { useGeolocation } from "../hooks/useGeolocation.js";

const VERIFICATION_CHECKS = [
  { id: 1, title: "Job country mismatch", description: "Check whether the candidate's IP country differs from the job country." },
  { id: 2, title: "Suspicious IP activity", description: "Check whether the IP is listed for suspicious activity or abuse." },
  { id: 3, title: "VPN detected", description: "Detect whether the candidate is connecting through a VPN." },
  { id: 4, title: "Residential proxy detected", description: "Detect whether the candidate is connecting through a residential proxy." },
  { id: 5, title: "Public proxy detected", description: "Detect whether the candidate is connecting through a public proxy." }
];

export default function Employer() {
  const [form, setForm] = useState({
    centreName: "",
    address: "",
    latitude: "",
    longitude: "",
    radiusKm: "2.4",
    jobCountry: "",
    checkFlags: [1, 2, 3, 4, 5]
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { getCurrentLocation, loading, error: locationError } = useGeolocation();

  useEffect(() => {
    api.getGeofence().then(data => setForm({
      centreName: data.centreName || "",
      address: data.address || "",
      latitude: String(data.latitude ?? ""),
      longitude: String(data.longitude ?? ""),
      radiusKm: String(Number(data.radiusMetres || 2400) / 1000),
      jobCountry: data.jobCountry || "",
      checkFlags: Array.isArray(data.checkFlags)
        ? data.checkFlags.map(Number)
        : [1, 2, 3, 4, 5]
    })).catch(() => {});
  }, []);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    setMessage("");
  }

  function toggleCheck(id) {
    setForm(current => ({
      ...current,
      checkFlags: current.checkFlags.includes(id)
        ? current.checkFlags.filter(item => item !== id)
        : [...current.checkFlags, id]
    }));
    setMessage("");
  }

  async function useLocation() {
    setError("");
    setMessage("");

    try {
      const position = await getCurrentLocation();
      setForm(current => ({
        ...current,
        latitude: String(position.latitude),
        longitude: String(position.longitude)
      }));
      setMessage("Current location added to the test centre.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const radiusKm = Number(form.radiusKm);
    const jobCountry = form.jobCountry.trim().toUpperCase();

    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 1000) {
      setError("Enter a radius greater than 0 km and no more than 1000 km.");
      return;
    }

    if (!/^[A-Z]{2}$/.test(jobCountry) && form.checkFlags.includes(1)) {
      setError("Enter a valid two-letter job country code, such as IN or GB.");
      return;
    }

    if (form.checkFlags.length === 0) {
      setError("Select at least one fraud verification check.");
      return;
    }

    setSaving(true);

    try {
      const result = await api.saveGeofence({
        centreName: form.centreName,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
        radiusMetres: radiusKm * 1000,
        jobCountry,
        checkFlags: form.checkFlags
      });

      setMessage(result.message || "Test centre and verification settings saved successfully.");

      if (result.geofence) {
        setForm(current => ({
          ...current,
          jobCountry: result.geofence.jobCountry || "",
          checkFlags: Array.isArray(result.geofence.checkFlags)
            ? result.geofence.checkFlags.map(Number)
            : current.checkFlags
        }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EMPLOYER WORKSPACE</div>
          <h1>Test centre configuration</h1>
          <p>Set the location, permitted radius and fraud checks candidates must pass.</p>
        </div>
        <span className="heading-icon"><ShieldCheck size={23} /></span>
      </div>

      <div className="content-grid">
        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <h2>Test centre details</h2>
              <p className="muted">Configure the GPS point used for candidate checks.</p>
            </div>
            <span className="step-number">01</span>
          </div>

          <form onSubmit={submit} className="form-stack">
            <label>
              Centre name
              <input
                value={form.centreName}
                onChange={e => update("centreName", e.target.value)}
                placeholder="e.g. GeoGate Assessment Centre"
                required
              />
            </label>

            <label>
              Centre address
              <input
                value={form.address}
                onChange={e => update("address", e.target.value)}
                placeholder="Enter the full address"
                required
              />
            </label>

            <div className="coordinate-header">
              <span>GPS coordinates</span>
              <button
                className="button button-soft button-small"
                type="button"
                onClick={useLocation}
                disabled={loading}
              >
                <Crosshair size={15} />
                {loading ? "Getting location..." : "Use my current location"}
              </button>
            </div>

            <div className="two-fields">
              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={e => update("latitude", e.target.value)}
                  placeholder="28.4595"
                  required
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={e => update("longitude", e.target.value)}
                  placeholder="77.0266"
                  required
                />
              </label>
            </div>

            <div className="radius-field">
              <label htmlFor="radiusKm">Permitted distance</label>
              <div className="input-suffix">
                <input
                  id="radiusKm"
                  type="number"
                  min="0.001"
                  max="1000"
                  step="any"
                  value={form.radiusKm}
                  onChange={e => update("radiusKm", e.target.value)}
                  required
                />
                <span>km</span>
              </div>
              <small>Enter any distance in kilometres, including decimals such as 2.4 km.</small>
            </div>

            <div className="verification-settings">
              <div className="section-heading">
                <div>
                  <h2>Job country</h2>
                  <p className="muted">Used for the candidate IP country comparison.</p>
                </div>
                <span className="step-number">02</span>
              </div>

              <label>
                Job country code
                <input
                  value={form.jobCountry}
                  onChange={e => update("jobCountry", e.target.value.toUpperCase())}
                  placeholder="e.g. IN or GB"
                  maxLength={2}
                />
                <small>Use the two-letter country code. Required when Job country mismatch is selected.</small>
              </label>
            </div>

            <div className="verification-settings">
              <div className="section-heading">
                <div>
                  <h2>Candidate fraud verification checks</h2>
                  <p className="muted">Select the checks candidates must pass before they can be authorized.</p>
                </div>
                <span className="step-number">03</span>
              </div>

              <div className="verification-options">
                {VERIFICATION_CHECKS.map(check => (
                  <label
                    key={check.id}
                    className="verification-option"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: form.checkFlags.includes(check.id) ? "#f5f4ff" : "#fff"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.checkFlags.includes(check.id)}
                      onChange={() => toggleCheck(check.id)}
                      style={{ width: "17px", height: "17px", marginTop: "3px", flexShrink: 0 }}
                    />
                    <span>
                      <strong style={{ display: "block" }}>{check.id}. {check.title}</strong>
                      <small style={{ display: "block", marginTop: "4px", color: "#718096", lineHeight: 1.5 }}>
                        {check.description}
                      </small>
                    </span>
                  </label>
                ))}
              </div>

              <small>{form.checkFlags.length} of 5 fraud checks selected. GPS distance is always checked separately.</small>
            </div>

            {(error || locationError) && (
              <p className="error-text">{error || locationError}</p>
            )}

            {message && <p className="success-text">{message}</p>}

            <button
              className="button button-primary button-wide"
              type="submit"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save test centre"}
            </button>
          </form>
        </section>

        <aside className="panel side-panel">
          <div className="side-icon"><MapPin size={20} /></div>
          <h3>How the permitted area works</h3>
          <p className="muted">
            GeoGate compares a candidate's device location with the saved test-centre coordinates. This GPS check is mandatory and separate from the five fraud checks.
          </p>

          <div className="radius-preview">
            <span>Configured radius</span>
            <strong>{Number(form.radiusKm) > 0 ? `${form.radiusKm} km` : "—"}</strong>
            <small>Measured from the centre point</small>
          </div>

          <div className="info-row">
            <span className="info-dot" />
            Inside the radius
            <b className="allowed">Eligible</b>
          </div>

          <div className="info-row">
            <span className="info-dot outside" />
            Outside the radius
            <b className="denied">Not eligible</b>
          </div>

          <div className="privacy-note">
            <CheckCircle2 size={14} /> {form.checkFlags.length} fraud checks selected.
            Location access is requested only after the candidate clicks the verification button.
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}