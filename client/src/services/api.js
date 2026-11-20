const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const api = {
  getGeofence: () => request("/geofence"),
  saveGeofence: payload => request("/geofence", { method: "PUT", body: JSON.stringify(payload) }),
  verifyCandidate: payload => request("/candidates/verify", { method: "POST", body: JSON.stringify(payload) }),
  getAttempt: id => request(`/candidates/attempts/${id}`),
  authorize: id => request(`/candidates/attempts/${id}/authorize`, { method: "POST" })
};
