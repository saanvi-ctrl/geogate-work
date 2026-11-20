import { LogOut, MapPin, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user?.role === "employer" ? "/employer" : "/candidate"}>
          <span className="brand-mark"><MapPin size={19} /></span>
          <span>GeoGate</span>
        </Link>
        <div className="topbar-right">
          {user && <span className="user-chip"><span className="status-dot" />{user.name} · {user.role}</span>}
          {user && <button className="button button-ghost button-small" onClick={handleLogout}><LogOut size={15} /> Log out</button>}
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer"><ShieldCheck size={14} /> Location verification for a safer check-in process</footer>
    </div>
  );
}
