import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";

function OrderTracking() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [shipmentTracking, setShipmentTracking] = useState(null);

  useEffect(() => {
    API.get(`/orders/${id}`).then(res => {
      setHistory(res.data.trackingHistory || []);
      setShipmentTracking(res.data.shipmentTracking || null);
    });
  }, [id]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Order Updates</h2>

      {shipmentTracking ? (
        <div style={{ marginBottom: 24, padding: 16, background: "#eef6ff", border: "1px solid #c9def5", borderRadius: 10 }}>
          <p><strong>Courier:</strong> {shipmentTracking.courier || "Awaiting dispatch"}</p>
          <p><strong>Tracking ID:</strong> {shipmentTracking.trackingId || "Will be generated after shipment"}</p>
          <p><strong>Status:</strong> {shipmentTracking.status || "Order placed"}</p>
        </div>
      ) : null}

      {history.map((h, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>{h.status}</strong>
          <p>{h.message}</p>
          <small>{new Date(h.date).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default OrderTracking;
