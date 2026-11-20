import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [role, setRole] = useState("employer");
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    if (!name.trim() || !id.trim()) {
      setError("Enter your name and ID to continue.");
      return;
    }
    login({ name: name.trim(), id: id.trim(), role });
    navigate(role === "employer" ? "/employer" : "/candidate");
  }

  return (
    <div className="login-grid">
      <section className="login-intro">
        <div className="eyebrow"><span className="eyebrow-line" /> LOCATION-BASED VERIFICATION</div>
        <h1>Check in with<br /><span>confidence.</span></h1>
        <p>GeoGate helps employers set a permitted test-centre area and lets candidates verify their location before check-in.</p>
        <div className="intro-points">
          <div><span className="point-icon"><MapPin size={18} /></span><span><b>Location aware</b><small>Use device GPS coordinates</small></span></div>
          <div><span className="point-icon"><BriefcaseBusiness size={18} /></span><span><b>Employer controlled</b><small>Configure a permitted radius</small></span></div>
        </div>
      </section>
      <section className="panel login-panel">
        <div className="panel-icon"><UserRound size={21} /></div>
        <h2>Welcome to GeoGate</h2>
        <p className="muted">Choose your workspace to continue.</p>
        <div className="role-switch">
          <button type="button" className={role === "employer" ? "role-option selected" : "role-option"} onClick={() => setRole("employer")}><BriefcaseBusiness size={17} /> Employer</button>
          <button type="button" className={role === "candidate" ? "role-option selected" : "role-option"} onClick={() => setRole("candidate")}><UserRound size={17} /> Candidate</button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" /></label>
          <label>{role === "employer" ? "Employer ID" : "Candidate ID"}<input value={id} onChange={e => setId(e.target.value)} placeholder={role === "employer" ? "e.g. EMP1024" : "e.g. CAN2048"} /></label>
          {error && <p className="error-text">{error}</p>}
          <button className="button button-primary button-wide" type="submit">Continue <ArrowRight size={17} /></button>
        </form>
        <p className="demo-note">Demo sign-in: enter any name and ID. Production authentication is not configured.</p>
      </section>
    </div>
  );
}
