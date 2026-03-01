import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";

function OrderTracking() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get(`/orders/${id}`).then(res => {
      setHistory(res.data.trackingHistory || []);
    });
  }, [id]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Order Updates</h2>

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
