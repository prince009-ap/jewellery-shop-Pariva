import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function SmallMapPreview({ lat, lng, onOpen }) {
  return (
    <div className="map-preview">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>

      <button className="open-map-btn" onClick={onOpen}>
        Select on Map
      </button>
    </div>
  );
}
