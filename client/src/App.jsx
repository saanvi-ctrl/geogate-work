import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Employer from "./pages/Employer.jsx";
import Candidate from "./pages/Candidate.jsx";
import Result from "./pages/Result.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? (user.role === "employer" ? "/employer" : "/candidate") : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/employer" element={<ProtectedRoute role="employer"><Employer /></ProtectedRoute>} />
      <Route path="/candidate" element={<ProtectedRoute role="candidate"><Candidate /></ProtectedRoute>} />
      <Route path="/result/:attemptId" element={<ProtectedRoute role="candidate"><Result /></ProtectedRoute>} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
