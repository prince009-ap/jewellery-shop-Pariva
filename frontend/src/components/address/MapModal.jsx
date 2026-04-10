import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

function MapController({ position, accuracy }) {
  const map = useMap();
  const circleRef = useRef(null);

  useEffect(() => {
    map.setView(position, 16, { animate: true });
  }, [map, position]);

  useEffect(() => {
    if (!accuracy) return;

    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    circleRef.current = L.circle(position, {
      radius: accuracy,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.15,
    }).addTo(map);

    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [map, position, accuracy]);

  return null;
}

export default function MapModal({ onClose, onSelect }) {
  const [position, setPosition] = useState([21.1702, 72.8311]);
  const [accuracy, setAccuracy] = useState(null);
  const [query, setQuery] = useState("");
  const [mapMessage, setMapMessage] = useState("");
  const [mapMessageType, setMapMessageType] = useState("info");

  const setStatusMessage = (message, type = "info") => {
    setMapMessage(message);
    setMapMessageType(type);
  };

  const isGujaratAddress = (address = {}) => {
    const stateText = [
      address.state,
      address.state_district,
      address.region,
      address.county,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return stateText.includes("gujarat");
  };

  const reverseLookup = async (lat, lng) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    return res.json();
  };

  const searchPlace = async () => {
    if (!query.trim()) {
      setStatusMessage("Search for an area, society, or place in Gujarat.", "error");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();

      if (!data[0]) {
        setStatusMessage("Place not found. Try a nearby Gujarat location.", "error");
        return;
      }

      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);
      const reverseData = await reverseLookup(lat, lon);

      if (!isGujaratAddress(reverseData.address)) {
        setStatusMessage("Out of Gujarat locations are not available.", "error");
        return;
      }

      setPosition([lat, lon]);
      setAccuracy(null);
      setStatusMessage("Gujarat location found. You can use this location now.", "success");
    } catch (error) {
      console.error("Location search failed:", error);
      setStatusMessage("Unable to search this location right now.", "error");
    }
  };

  const currentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported on this device.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (coords) => {
        const { latitude, longitude, accuracy: locationAccuracy } = coords.coords;

        try {
          const reverseData = await reverseLookup(latitude, longitude);

          if (!isGujaratAddress(reverseData.address)) {
            setStatusMessage("Out of Gujarat locations are not available.", "error");
            return;
          }

          setPosition([latitude, longitude]);
          setAccuracy(locationAccuracy);
          setStatusMessage("Current Gujarat location selected.", "success");
        } catch (error) {
          console.error("Current location lookup failed:", error);
          setStatusMessage("Unable to verify your current location.", "error");
        }
      },
      (error) => {
        console.error(error);
        setStatusMessage("Failed to get current location.", "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const useLocation = async () => {
    const [lat, lng] = position;

    try {
      const data = await reverseLookup(lat, lng);

      if (!isGujaratAddress(data.address)) {
        setStatusMessage("Out of Gujarat locations are not available.", "error");
        return;
      }

      onSelect({
        lat,
        lng,
        display_name: data.display_name,
        address: data.address,
      });

      onClose();
    } catch (error) {
      console.error("Use location failed:", error);
      setStatusMessage("Unable to use this location right now.", "error");
    }
  };

  return (
    <div className="map-modal">
      <div className="map-modal__card">
        <div className="map-top">
          <input
            placeholder="Search area / society / place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={searchPlace}>Search</button>
          <button type="button" onClick={currentLocation}>Current</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        {mapMessage ? (
          <div className={`map-inline-message ${mapMessageType}`}>{mapMessage}</div>
        ) : null}

        <div className="map-modal__map">
          <MapContainer center={position} zoom={16} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} />
            <MapController position={position} accuracy={accuracy} />
          </MapContainer>
        </div>

        <div className="map-modal__actions">
          <button className="use-location-btn" type="button" onClick={useLocation}>
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
}
