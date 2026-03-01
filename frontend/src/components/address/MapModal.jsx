import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import L from "leaflet";
import { useEffect } from "react";

/* Helper component to control map */
function MapController({ position, accuracy }) {
  const map = useMap();
  const circleRef = useRef(null);

  // map center
  useEffect(() => {
    map.setView(position, 16, { animate: true });
  }, [map, position]);

  // accuracy circle
  useEffect(() => {
    if (!accuracy) return;

    // remove old circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // add new circle
    circleRef.current = L.circle(position, {
      radius: accuracy,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.15,
    }).addTo(map);

    // cleanup on unmount
    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [map, position, accuracy]);

  return null;
}
export default function MapModal({ onClose, onSelect }) {
  const [position, setPosition] = useState([21.1702, 72.8311]); // Surat
  const [accuracy, setAccuracy] = useState(null);
  const [query, setQuery] = useState("");

  /* 🔍 Search place */
  const searchPlace = async () => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    if (!data[0]) return alert("Place not found");

    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);

    setPosition([lat, lon]);
    setAccuracy(null);
  };

  /* 📍 Current location */
  const currentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude, accuracy } = p.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);
      },
      (err) => {
        alert("Failed to get location");
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };
  const useLocation = async () => {
  const lat = position[0];
  const lng = position[1];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();

  onSelect({
    lat,
    lng,
    display_name: data.display_name,
    address: data.address,
  });

  onClose();
};


  return (
    <div className="map-modal">
      <div className="map-top">
        <input
          placeholder="Search area / society / place"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchPlace}>Search</button>
        <button onClick={currentLocation}>📍 Current</button>
        <button onClick={onClose}>✖</button>
      </div>

      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
        <MapController position={position} accuracy={accuracy} />
      </MapContainer>

      <button className="use-location-btn" onClick={useLocation}>
  Use this location
</button>

    </div>
  );
}
