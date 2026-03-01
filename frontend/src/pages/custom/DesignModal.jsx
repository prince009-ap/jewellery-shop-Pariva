import { useState } from "react";
import adminAPI from "../../services/adminApi";

export default function DesignModal({ design, onClose, onUpdate }) {
  const [finalWeight, setFinalWeight] = useState("");
  const [makingCharge, setMakingCharge] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [reason, setReason] = useState("");

  const approve = async () => {
    await adminAPI.put(
      `/admin/custom-design/${design._id}/approve`,
      { finalWeight, makingCharge, goldRate }
    );
    alert("Approved ✅");
    onUpdate();
    onClose();
  };

  const reject = async () => {
    await adminAPI.put(
      `/admin/custom-design/${design._id}/reject`,
      { reason }
    );
    alert("Rejected ❌");
    onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay">
    <div className="modal-card">
      <h3>{design.jewelleryType}</h3>

      {design.referenceImage && (
        <img
          src={`http://localhost:5000/uploads/${design.referenceImage}`}
          width="250"
        />
      )}

      <p><b>User:</b> {design.userId?.email}</p>
<p><b>Metal:</b> {design.metalType}</p>
<p><b>Purity:</b> {design.purity}</p>
<p><b>Weight:</b> {design.approxWeight} gm</p>
<p><b>Status:</b> {design.status}</p>


      <hr />

      <h4>Approve</h4>
      <input placeholder="Final Weight (gm)" onChange={e=>setFinalWeight(e.target.value)} />
      <input placeholder="Gold Rate" onChange={e=>setGoldRate(e.target.value)} />
      <input placeholder="Making Charge" onChange={e=>setMakingCharge(e.target.value)} />

      <button onClick={approve}>Approve</button>

      <hr />

      <h4>Reject</h4>
      <textarea placeholder="Reject reason" onChange={e=>setReason(e.target.value)} />
      <button onClick={reject}>Reject</button>

      <br />
      <button onClick={onClose}>Close</button>
    </div>
    </div>
  );
}
