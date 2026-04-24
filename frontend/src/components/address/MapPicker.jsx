import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import leafletMarkerIcon from "./leafletMarkerIcon";

function LocationMarker({ setLatLng }) {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng);
    },
  });

  return null;
}

export default function MapPicker({ lat, lng, onChange }) {
  if (!lat || !lng) return null;

  return (
    <div style={{ height: "300px", width: "100%", marginTop: 20 }}>
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={leafletMarkerIcon} />
        <LocationMarker setLatLng={onChange} />
      </MapContainer>
    </div>
  );
}
