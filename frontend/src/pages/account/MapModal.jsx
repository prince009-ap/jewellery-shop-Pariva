import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import leafletMarkerIcon from "../../components/address/leafletMarkerIcon";

function LocationMarker({ setLatLng, setAddress }) {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng);
      reverseGeocode(e.latlng, setAddress);
    },
  });
  return null;
}

async function reverseGeocode({ lat, lng }, setAddress) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  setAddress(data.display_name || "");
}

export default function MapModal({ latLng, setLatLng, setAddress, onClose }) {
  return (
    <div className="map-modal">
      <MapContainer center={[latLng.lat, latLng.lng]} zoom={16}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latLng.lat, latLng.lng]} icon={leafletMarkerIcon} />
        <LocationMarker
          setLatLng={setLatLng}
          setAddress={setAddress}
        />
      </MapContainer>

      <button className="close-map-btn" onClick={onClose}>
        Done
      </button>
    </div>
  );
}
    
