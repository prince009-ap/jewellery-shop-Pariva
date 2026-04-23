import { API_BASE_URL } from "../../services/api";
import { useState } from "react";
import adminAPI from "../../services/adminApi";

export default function DesignModal({ design, onClose, onUpdate, onNotify }) {
  const [finalWeight, setFinalWeight] = useState("");
  const [makingCharge, setMakingCharge] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [stoneCharge, setStoneCharge] = useState("");
  const [gstPercent, setGstPercent] = useState("3");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [reason, setReason] = useState("");
  const [suggestAlternative, setSuggestAlternative] = useState(false);
  const [alternativeJewelleryType, setAlternativeJewelleryType] = useState("");
  const [alternativeMetalType, setAlternativeMetalType] = useState("");
  const [alternativeApproxPrice, setAlternativeApproxPrice] = useState("");
  const [alternativeNote, setAlternativeNote] = useState("");
  const [submitting, setSubmitting] = useState("");
  const metalName = design.metalType || "Metal";
  const metalRatePlaceholder = `${metalName} Rate`;

  const parsedWeight = Number(finalWeight || 0);
  const parsedRate = Number(goldRate || 0);
  const parsedMaking = Number(makingCharge || 0);
  const parsedStone = Number(stoneCharge || 0);
  const parsedGstPercent = Number(gstPercent || 0);
  const baseAmount = parsedWeight * parsedRate + parsedMaking + parsedStone;
  const gstAmount = (baseAmount * parsedGstPercent) / 100;
  const grandTotal = Math.round((baseAmount + gstAmount) * 100) / 100;

  const approve = async () => {
    try {
      setSubmitting("approve");
      await adminAPI.put(`/admin/custom-design/${design._id}/approve`, {
        finalWeight,
        makingCharge,
        goldRate,
        metalRate: goldRate,
        stoneCharge,
        gstPercent,
        deliveryDays,
        adminNote,
      });
      onNotify?.("Request approved");
      await onUpdate();
      onClose();
    } catch {
      onNotify?.("Failed to approve request", "error");
    } finally {
      setSubmitting("");
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      onNotify?.("Reject reason is required", "error");
      return;
    }

    try {
      setSubmitting("reject");
      await adminAPI.put(`/admin/custom-design/${design._id}/reject`, {
        reason,
        alternativeJewelleryType: suggestAlternative ? alternativeJewelleryType : "",
        alternativeMetalType: suggestAlternative ? alternativeMetalType : "",
        alternativeApproxPrice: suggestAlternative ? alternativeApproxPrice : "",
        alternativeNote: suggestAlternative ? alternativeNote : "",
      });
      onNotify?.("Request rejected");
      await onUpdate();
      onClose();
    } catch {
      onNotify?.("Failed to reject request", "error");
    } finally {
      setSubmitting("");
    }
  };

  return (
    <div className="acd-modal-overlay">
      <div className="acd-modal-card">
        <div className="acd-modal-head">
          <div>
            <p className="acd-modal-kicker">Custom Request</p>
            <h3>{design.jewelleryType || "Custom Jewellery"}</h3>
          </div>
          <span className="acd-modal-status">{design.status || "pending"}</span>
        </div>

        {design.referenceImage && (
          <img
            className="acd-modal-image"
            src={`${API_BASE_URL}/uploads/${design.referenceImage}`}
            alt={design.jewelleryType || "Reference"}
          />
        )}

        <div className="acd-modal-info">
          <p>
            <b>Name:</b> {design.userId?.name || "N/A"}
          </p>
          <p>
            <b>Email:</b> {design.userId?.email || "N/A"}
          </p>
          <p>
            <b>Mobile:</b> {design.userId?.mobile || "N/A"}
          </p>
          <p>
            <b>Metal:</b> {design.metalType || "N/A"}
          </p>
          <p>
            <b>Purity:</b> {design.purity || "N/A"}
          </p>
          <p>
            <b>Weight:</b> {design.approxWeight || "N/A"} gm
          </p>
        </div>

        <div className="acd-modal-grid">
          <section className="acd-modal-block">
            <h4>Approve</h4>
            <input
              placeholder="Final Weight (gm)"
              onChange={(e) => setFinalWeight(e.target.value)}
              value={finalWeight}
            />
            <input
              placeholder={metalRatePlaceholder}
              onChange={(e) => setGoldRate(e.target.value)}
              value={goldRate}
            />
            <input
              placeholder="Making Charge"
              onChange={(e) => setMakingCharge(e.target.value)}
              value={makingCharge}
            />
            <input
              placeholder="Stone Charge (optional)"
              onChange={(e) => setStoneCharge(e.target.value)}
              value={stoneCharge}
            />
            <input
              placeholder="GST % (optional)"
              onChange={(e) => setGstPercent(e.target.value)}
              value={gstPercent}
            />
            <input
              placeholder="Delivery ETA (days, optional)"
              onChange={(e) => setDeliveryDays(e.target.value)}
              value={deliveryDays}
            />
            <textarea
              placeholder="Admin note (optional)"
              onChange={(e) => setAdminNote(e.target.value)}
              value={adminNote}
            />
            <div className="acd-quote-preview">
              <p>
                <span>Base</span>
                <strong>Rs {baseAmount.toFixed(2)}</strong>
              </p>
              <p>
                <span>GST</span>
                <strong>Rs {gstAmount.toFixed(2)}</strong>
              </p>
              <p className="total">
                <span>Total</span>
                <strong>Rs {grandTotal.toFixed(2)}</strong>
              </p>
            </div>
            <button
              type="button"
              className="acd-modal-btn approve"
              onClick={approve}
              disabled={submitting !== ""}
            >
              {submitting === "approve" ? "Approving..." : "Approve"}
            </button>
          </section>

          <section className="acd-modal-block">
            <h4>Reject</h4>
            <textarea
              placeholder="Reject reason"
              onChange={(e) => setReason(e.target.value)}
              value={reason}
            />
            <div className="acd-reject-tools">
              <label className="acd-suggest-toggle ui-check-label">
                <input
                  type="checkbox"
                  className="ui-check-input"
                  checked={suggestAlternative}
                  onChange={(e) => setSuggestAlternative(e.target.checked)}
                />
                <span className="ui-check-box" aria-hidden="true"></span>
                <span className="ui-check-text">Suggest alternative option</span>
              </label>
            </div>
            {suggestAlternative && (
              <div className="acd-alt-wrap">
                <p className="acd-alt-title">Alternative Proposal</p>
                <div className="acd-alt-fields">
                  <input
                    placeholder="Alternative Jewellery Type"
                    value={alternativeJewelleryType}
                    onChange={(e) => setAlternativeJewelleryType(e.target.value)}
                  />
                  <input
                    placeholder="Alternative Metal"
                    value={alternativeMetalType}
                    onChange={(e) => setAlternativeMetalType(e.target.value)}
                  />
                  <input
                    placeholder="Approx Price"
                    value={alternativeApproxPrice}
                    onChange={(e) => setAlternativeApproxPrice(e.target.value)}
                  />
                  <textarea
                    placeholder="Alternative note"
                    value={alternativeNote}
                    onChange={(e) => setAlternativeNote(e.target.value)}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              className="acd-modal-btn reject"
              onClick={reject}
              disabled={submitting !== ""}
            >
              {submitting === "reject" ? "Rejecting..." : "Reject"}
            </button>
          </section>
        </div>

        <div className="acd-modal-actions">
          <button type="button" className="acd-modal-btn close" onClick={onClose} disabled={submitting !== ""}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
