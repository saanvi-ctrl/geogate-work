
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  ShieldCheck,
  XCircle,
  MinusCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import { api } from "../services/api.js";

const CHECK_NAMES = {
  1: "Job country mismatch",
  2: "Suspicious IP activity",
  3: "VPN detected",
  4: "Residential proxy detected",
  5: "Public proxy detected"
};

const km = metres => {
  if (metres === undefined || metres === null || metres === "") {
    return "Not available";
  }

  const value = Number(metres);
  return Number.isFinite(value)
    ? `${(value / 1000).toFixed(2)} km`
    : "Not available";
};

export default function Result() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getAttempt(attemptId)
      .then(data => {
        setAttempt(data.attempt || data);
      })
      .catch(e => setError(e.message));
  }, [attemptId]);

  async function authorize() {
    setAuthorizing(true);
    setError("");

    try {
      const result = await api.authorize(attemptId);
      setAttempt(result.attempt || result);
      setMessage(result.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setAuthorizing(false);
    }
  }

  if (error && !attempt) {
    return (
      <AppLayout>
        <div className="panel result-panel">
          <p className="error-text">{error}</p>
          <Link className="button button-primary" to="/candidate">
            Back
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!attempt) {
    return (
      <AppLayout>
        <div className="panel result-panel">
          Loading verification result...
        </div>
      </AppLayout>
    );
  }

  const accessAllowed = attempt.allowed === true;

  const checkResults = Array.isArray(attempt.checkResults)
    ? attempt.checkResults
    : [];

  const checkFlags = Array.isArray(attempt.checkFlags)
    ? attempt.checkFlags.map(Number)
    : [];

  const locationRecorded =
    typeof attempt.locationPassed === "boolean";

  const locationPassed = attempt.locationPassed === true;

  const allChecks = Object.entries(CHECK_NAMES).map(([id, name]) => {
    const checkId = Number(id);
    const result = checkResults.find(
      check => Number(check.checkId) === checkId
    );

    const selected =
      checkFlags.includes(checkId) || Boolean(result);

    return {
      checkId,
      name,
      selected,
      result
    };
  });

  const selectedChecks = allChecks.filter(check => check.selected);
  const passedChecks = selectedChecks.filter(
    check => check.result?.passed === true
  ).length;
  const totalChecks = selectedChecks.length;

  return (
    <AppLayout>
      <div className="result-wrap">
        <section className={`result-hero ${accessAllowed ? "result-allowed" : "result-denied"}`}>
          <div className="result-symbol">
            {accessAllowed ? (
              <CheckCircle2 size={35} />
            ) : (
              <XCircle size={35} />
            )}
          </div>

          <div className="eyebrow">
            {accessAllowed ? "VERIFICATION PASSED" : "VERIFICATION FAILED"}
          </div>

          <h1>
            {accessAllowed
              ? "You are allowed to take the test"
              : "You are not authorized"}
          </h1>

          <p>
            {accessAllowed
              ? "The candidate passed the mandatory GPS check and all selected fraud checks."
              : "The candidate did not pass the mandatory GPS check or one or more selected fraud checks."}
          </p>
        </section>

        <section className="panel result-panel">
          <h2>Verification details</h2>

          <div className="metric-grid">
            <div className="metric">
              <span>Your distance</span>
              <strong>{km(attempt.distanceMetres)}</strong>
            </div>

            <div className="metric">
              <span>Permitted radius</span>
              <strong>{km(attempt.radiusMetres)}</strong>
            </div>
          </div>

          <div className="detail-line">
            <MapPin size={17} />
            <span>
              <b>{attempt.centreName || "Test centre not available"}</b>
              <small>{attempt.address || "Address not available"}</small>
            </span>
          </div>

          <div className="detail-line">
            <ShieldCheck size={17} />
            <span>
              <b>{attempt.candidateName || "Candidate name not available"}</b>
              <small>Candidate ID: {attempt.candidateId || "Not available"}</small>
            </span>
          </div>

          <div style={{ marginTop: "26px" }}>
            <h2>GPS location verification</h2>

            <div
              className="info-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                marginTop: "14px"
              }}
            >
              {locationPassed ? (
                <CheckCircle2 size={19} color="#16a36a" />
              ) : locationRecorded ? (
                <XCircle size={19} color="#e05260" />
              ) : (
                <MinusCircle size={19} />
              )}

              <span style={{ flex: 1 }}>
                <b>
                  {locationPassed
                    ? "Candidate is within the permitted test-centre radius"
                    : locationRecorded
                      ? "Candidate is outside the permitted test-centre radius"
                      : "GPS result was not recorded"}
                </b>
              </span>

              <b className={locationPassed ? "allowed" : "denied"}>
                {locationPassed
                  ? "Passed"
                  : locationRecorded
                    ? "Failed"
                    : "Not recorded"}
              </b>
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <h2>Selected fraud verification results</h2>

            <div
              className="info-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                marginTop: "14px",
                marginBottom: "14px"
              }}
            >
              <b>Fraud checks passed</b>
              <b className={passedChecks === totalChecks ? "allowed" : "denied"}>
                {passedChecks}/{totalChecks} Passed
              </b>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {allChecks.map(check => {
                const passed = check.result?.passed === true;
                const failed = check.result?.passed === false;
                const status = !check.selected
                  ? "Not selected"
                  : passed
                    ? "Passed"
                    : failed
                      ? "Failed"
                      : "Not recorded";

                return (
                  <div
                    key={check.checkId}
                    className="info-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px"
                    }}
                  >
                    {passed ? (
                      <CheckCircle2 size={19} color="#16a36a" />
                    ) : failed ? (
                      <XCircle size={19} color="#e05260" />
                    ) : (
                      <MinusCircle size={19} />
                    )}

                    <span style={{ flex: 1 }}>
                      <b>{check.checkId}. {check.name}</b>
                    </span>

                    <b className={passed ? "allowed" : failed ? "denied" : "muted"}>
                      {status}
                    </b>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "26px" }}>
            <h2>IP verification details</h2>

            <div className="detail-line">
              <ShieldCheck size={17} />
              <span>
                <b>Job country</b>
                <small>{attempt.jobCountry || "Not configured"}</small>
              </span>
            </div>

            <div className="detail-line">
              <MapPin size={17} />
              <span>
                <b>Candidate IP country</b>
                <small>{attempt.candidateCountry || "Not available"}</small>
              </span>
            </div>

            {attempt.ipAddress && (
              <div className="detail-line">
                <ShieldCheck size={17} />
                <span>
                  <b>Public IP checked</b>
                  <small>{attempt.ipAddress}</small>
                </span>
              </div>
            )}

            {attempt.networkCheckCompleted === false && (
              <p className="error-text">
                The IP verification service did not complete successfully.
                Selected IP checks cannot be treated as passed.
                {attempt.networkCheckMessage
                  ? ` ${attempt.networkCheckMessage}`
                  : ""}
              </p>
            )}
          </div>

          {accessAllowed && !attempt.authorized && (
            <button
              className="button button-primary button-wide"
              onClick={authorize}
              disabled={authorizing}
            >
              {authorizing ? "Authorizing..." : "Authorize candidate"}
            </button>
          )}

          {!accessAllowed && (
            <p className="error-text">
              Candidate not authorized. The mandatory GPS check and all selected fraud checks must pass.
            </p>
          )}

          {attempt.authorized && accessAllowed && (
            <p className="success-text">
              {message || "Candidate authorized successfully."}
            </p>
          )}

          {error && <p className="error-text">{error}</p>}

          <Link className="back-link" to="/candidate">
            Return to candidate workspace
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}
