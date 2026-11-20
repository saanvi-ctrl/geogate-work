import { useState } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getCurrentLocation() {
    setError("");
    if (!navigator.geolocation) {
      const message = "Geolocation is not supported by this browser.";
      setError(message);
      return Promise.reject(new Error(message));
    }

    setLoading(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => {
          const message = error.code === 1
            ? "Location permission was denied. Change this site's location permission to Ask or Allow in your browser settings."
            : error.code === 3
              ? "The location request timed out. Please try again."
              : "Could not determine your location. Check your device location services.";
          setLoading(false);
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  return { getCurrentLocation, loading, error };
}
