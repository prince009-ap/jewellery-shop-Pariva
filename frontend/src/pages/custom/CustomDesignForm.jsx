import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { Link, useNavigate } from "react-router-dom";

const JEWELLERY_TYPES = ["Ring", "Necklace", "Bangle", "Bracelet", "Earrings", "Pendant", "Chain", "Other"];
const METALS = ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold", "Brass", "Copper", "Alloy", "Stainless Steel"];

// Dynamic purity options based on metal type
const PURITY_OPTIONS = {
  "Gold": ["24K", "22K", "20K", "18K", "14K", "10K"],
  "Silver": ["999", "925", "800"],
  "Platinum": ["PT950", "PT900"],
  "Rose Gold": ["22K", "18K", "14K", "10K"],
  "White Gold": ["22K", "18K", "14K", "10K"],
  "Brass": ["Pure", "Mixed"],
  "Copper": ["Pure", "Mixed"],
  "Alloy": ["Standard", "Premium"],
  "Stainless Steel": ["316L", "304", "Surgical"]
};

const STONES = ["None", "Diamond", "Emerald", "Ruby", "Sapphire", "Moissanite", "Pearl", "Opal", "Topaz"];
const RING_SIZES = Array.from({ length: 19 }, (_, i) => i + 6); // 6–24

const NECKLACE_LENGTHS = ["14 in", "16 in", "18 in", "20 in", "22 in", "24 in", "26 in"];

const BANGLE_SIZES = ["2-2", "2-4", "2-6", "2-8", "3-0", "3-2", "3-4"];
const FINISHES = ["Matte", "Glossy", "Antique", "Hammered", "Brushed", "Polished", "Satin"];
const OCCASIONS = ["Wedding", "Engagement", "Anniversary", "Daily Wear", "Office Wear", "Festive", "Traditional", "Temple", "Gift", "Bridal", "Kids", "Casual", "Statement"];

// Budget-first options
const BUDGET_TIERS = [
  { label: "Under ₹2,000", min: 0, max: 2000, category: "budget" },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000, category: "budget" },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000, category: "mid" },
  { label: "₹10,000+", min: 10000, max: Infinity, category: "premium" }
];

// Purpose options
const PURPOSES = ["Self", "Gift", "Couple", "Proposal", "Anniversary"];

// Budget-based material recommendations
const BUDGET_MATERIALS = {
  budget: {
    recommended: ["Silver 925", "Gold Plated", "Alloy", "Brass"],
    avoid: ["Gold 22K", "Platinum", "Diamond"],
    maxStoneValue: 5000
  },
  mid: {
    recommended: ["Gold 14K", "Silver 999", "Rose Gold 14K"],
    avoid: ["Platinum PT950", "Diamond Large"],
    maxStoneValue: 15000
  },
  premium: {
    recommended: ["Gold 22K", "Platinum PT950", "Diamond"],
    avoid: [],
    maxStoneValue: Infinity
  }
};

// Purpose-based suggestions
const PURPOSE_SUGGESTIONS = {
  "Couple": {
    jewelleryTypes: ["Ring", "Pendant", "Bracelet"],
    designs: ["Matching Sets", "Engraved Couple Names", "Coordinated Styles"],
    materials: ["Same Metal for Both", "Complementary Stones"],
    weight: "Lightweight (2-8g each)"
  },
  "Proposal": {
    jewelleryTypes: ["Ring"],
    designs: ["Solitaire Diamond", "Classic Setting", "Elegant Band"],
    materials: ["Gold 18K/22K", " Platinum", "Diamond"],
    weight: "Premium (5-12g)"
  },
  "Anniversary": {
    jewelleryTypes: ["Pendant", "Earrings", "Bracelet"],
    designs: ["Engraved Dates", "Birthstones", "Memorial Designs"],
    materials: ["Gold 14K/18K", "White Gold", "Mixed Metals"],
    weight: "Medium (3-10g)"
  },
  "Gift": {
    jewelleryTypes: ["Pendant", "Earrings", "Chain"],
    designs: ["Timeless Classics", "Versatile Pieces", "Safe Allergy Options"],
    materials: ["Silver 925", "Gold Plated", "Hypoallergenic"],
    weight: "Light (2-6g)"
  },
  "Self": {
    jewelleryTypes: ["All Types"],
    designs: ["Personal Expression", "Daily Wear", "Custom Preferences"],
    materials: ["User Preference", "Budget Appropriate"],
    weight: "User Choice"
  }
};


export default function CustomDesignForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
  budgetTier: null, // New budget-first selection
  purpose: "Self", // New purpose selection
  jewelleryType: "Ring",
  metal: "Gold",
  purity: "22K",
  stone: "Diamond",
  ringSize: 12,
  necklaceLength: "18 in",
  bangleSize: "2-6",
  approxWeight: 5,
  finish: "Glossy",
  occasion: "Daily Wear",
  description: "",
  customJewelleryType: "",
});


  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setSubmitted] = useState(false);
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* 🔢 LIVE ESTIMATE (frontend only – admin final karega) */
  const estimate = useMemo(() => {
    // Base prices by jewellery type
    const basePrices = {
      "Ring": 30000,
      "Necklace": 60000,
      "Bangle": 45000,
      "Bracelet": 40000,
      "Earrings": 35000,
      "Pendant": 25000,
      "Chain": 50000
    };

    // Metal multipliers
    const metalMultipliers = {
      "Gold": 1.0,
      "Silver": 0.4,
      "Platinum": 2.5,
      "Rose Gold": 1.1,
      "White Gold": 1.1,
      "Brass": 0.2,
      "Copper": 0.3,
      "Alloy": 0.5,
      "Stainless Steel": 0.1
    };

    // Purity multipliers
    const purityMultipliers = {
      "24K": 1.4, "22K": 1.3, "20K": 1.2, "18K": 1.15, "14K": 1.1, "10K": 1.0,
      "999": 1.2, "925": 1.0, "800": 0.9,
      "PT950": 2.8, "PT900": 2.6,
      "Pure": 1.1, "Mixed": 1.0,
      "Standard": 1.0, "Premium": 1.2,
      "316L": 1.1, "304": 1.0, "Surgical": 1.2
    };

    // Stone multipliers
    const stoneMultipliers = {
      "None": 1.0,
      "Diamond": 1.7,
      "Emerald": 1.5,
      "Ruby": 1.5,
      "Sapphire": 1.4,
      "Moissanite": 1.3,
      "Pearl": 1.2,
      "Opal": 1.3,
      "Topaz": 1.2
    };

    // Get base price (use default for custom types)
    const basePrice = basePrices[form.jewelleryType] || 35000;
    
    // Calculate multipliers
    const metalMultiplier = metalMultipliers[form.metal] || 1.0;
    const purityMultiplier = purityMultipliers[form.purity] || 1.0;
    const stoneMultiplier = stoneMultipliers[form.stone] || 1.0;
    const weightMultiplier = form.approxWeight / 5;

    // Calculate final estimate
    const finalEstimate = Math.round(
      basePrice * metalMultiplier * purityMultiplier * stoneMultiplier * weightMultiplier
    );

    return finalEstimate;
  }, [form]);

  // Smart budget validation and recommendations
  const budgetValidation = useMemo(() => {
    if (!form.budgetTier) return { valid: true, message: "", recommendations: [] };
    
    const { min, max, category } = form.budgetTier;
    const budgetMaterials = BUDGET_MATERIALS[category];
    
    // Check if current selection exceeds budget
    if (estimate > max) {
      return {
        valid: false,
        message: `Your selection (₹${estimate.toLocaleString("en-IN")}) exceeds your budget (₹${max.toLocaleString("en-IN")}).`,
        recommendations: budgetMaterials.recommended,
        avoid: budgetMaterials.avoid,
        suggestion: `Consider: ${budgetMaterials.recommended.join(", ")} for your budget range`
      };
    }
    
    if (estimate < min && category !== "budget") {
      return {
        valid: false,
        message: `Your selection is below your budget range. Consider upgrading materials.`,
        recommendations: ["Gold 18K/22K", "Premium Stones", "Platinum"],
        avoid: [],
        suggestion: "You can afford better quality materials!"
      };
    }
    
    return { valid: true, message: "", recommendations: [], avoid: [] };
  }, [estimate, form.budgetTier]);

  // Purpose-based suggestions
  const purposeSuggestions = useMemo(() => {
    if (!form.purpose || form.purpose === "Self") return null;
    return PURPOSE_SUGGESTIONS[form.purpose];
  }, [form.purpose]);

  /* 📤 SUBMIT TO BACKEND */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Budget tier validation
    if (!form.budgetTier) {
      setMessage({ type: "error", text: "Please select your budget range first." });
      setLoading(false);
      return;
    }

    // Validation for custom jewellery type
    if (form.jewelleryType === "Other" && !form.customJewelleryType.trim()) {
      setMessage({ type: "error", text: "Please specify jewellery type when selecting 'Other'." });
      setLoading(false);
      return;
    }

    // Smart budget validation
    if (!budgetValidation.valid) {
      setMessage({
        type: "error",
        text: `${budgetValidation.message} Suggestion: ${budgetValidation.suggestion}`,
      });
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      
      // Handle custom jewellery type
      const finalJewelleryType = form.jewelleryType === "Other" 
        ? form.customJewelleryType.trim() 
        : form.jewelleryType;
      
      // Add all form data with custom type handling
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'customJewelleryType') return; // Skip custom field, use processed value
        if (k === 'budgetTier') {
          fd.append(k, JSON.stringify(v)); // Convert budget tier to string
        } else if (k === 'jewelleryType') {
          fd.append(k, finalJewelleryType); // Use processed jewellery type
        } else {
          fd.append(k, v);
        }
      });
      
      if (image) fd.append("referenceImage", image);

      await API.post("/custom-design", fd);

      setSubmitted(true);
      setMessage({ type: "success", text: "Design request submitted successfully." });
      navigate("/my-custom-designs");
    } catch (err) {
      console.error("SUBMIT ERROR:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || err.message || "Something went wrong";
      setMessage({ type: "error", text: `Failed: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  /* 🔘 PILL UI HELPER */
  const PillGroup = ({ list, value, onChange }) => (
    <div className="pill-group">
      {list.map((v) => (
        <button
          key={v}
          type="button"
          className={`pill-toggle ${value === v ? "active" : ""}`}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="custom-page">
      <div className="custom-breadcrumb">
        <Link to="/home">Home</Link>
        <span>/</span>
        <span>Custom Studio</span>
      </div>

      <header className="page-header">
        <p className="hero-kicker">PARIVA Studio</p>
        <h1>Custom Jewellery Design</h1>
        <p>Create jewellery exactly the way you imagine it.</p>
        <p className="custom-step-indicator">
          Step {step} of 4
        </p>
      </header>

      <section className="custom-layout">
        <div className="form-container">
          <form className="custom-form" onSubmit={submit}>
            <div className="form-grid">
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="form-section">
                    <h2 className="section-title">Select Your Budget</h2>
                    <div className="field">
                      <label className="field-label">Budget Range</label>
                      <PillGroup 
                        list={BUDGET_TIERS.map(b => b.label)} 
                        value={form.budgetTier?.label || ""} 
                        onChange={(label) => {
                          const budget = BUDGET_TIERS.find(b => b.label === label);
                          setForm({ ...form, budgetTier: budget });
                        }} 
                      />
                      <small className="field-hint">We'll recommend materials based on your budget</small>
                    </div>
                  </div>

                  <div className="form-section">
                    <h2 className="section-title">Purpose</h2>
                    <div className="field">
                      <label className="field-label">Who is this for?</label>
                      <PillGroup 
                        list={PURPOSES} 
                        value={form.purpose} 
                        onChange={(v) => setForm({ ...form, purpose: v })} 
                      />
                      <small className="field-hint">We'll suggest designs based on your purpose</small>
                    </div>
                  </div>

                  {/* Purpose-based Suggestions */}
                  {purposeSuggestions && (
                    <div className="form-section purpose-suggestions">
                      <h3 className="suggestion-title">💡 Perfect for {form.purpose}!</h3>
                      <div className="suggestion-grid">
                        <div className="suggestion-card">
                          <h4>Recommended Types</h4>
                          <ul>
                            {purposeSuggestions.jewelleryTypes.map((type, i) => (
                              <li key={i}>• {type}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="suggestion-card">
                          <h4>Design Ideas</h4>
                          <ul>
                            {purposeSuggestions.designs.map((design, i) => (
                              <li key={i}>• {design}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="suggestion-card">
                          <h4>Best Materials</h4>
                          <ul>
                            {purposeSuggestions.materials.map((material, i) => (
                              <li key={i}>• {material}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="suggestion-card">
                          <h4>Ideal Weight</h4>
                          <p>{purposeSuggestions.weight}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Budget-based Material Recommendations */}
                  {form.budgetTier && budgetValidation.recommendations.length > 0 && (
                    <div className="form-section budget-recommendations">
                      <h3 className="suggestion-title">💰 Budget-Friendly Materials</h3>
                      <div className="recommendation-grid">
                        <div className="recommendation-card recommended">
                          <h4>✅ Recommended</h4>
                          <ul>
                            {budgetValidation.recommendations.map((material, i) => (
                              <li key={i}>• {material}</li>
                            ))}
                          </ul>
                        </div>
                        {budgetValidation.avoid.length > 0 && (
                          <div className="recommendation-card avoid">
                            <h4>⚠️ Avoid for Budget</h4>
                            <ul>
                              {budgetValidation.avoid.map((material, i) => (
                                <li key={i}>• {material}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="budget-tip">
                        <strong>💡 Tip:</strong> {budgetValidation.suggestion}
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
                      Next →
                    </button>
                  </div>

                  {message && (
                    <div className={`custom-inline-message custom-inline-message-${message.type}`}>
                      {message.text}
                    </div>
                  )}
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="form-section">
                    <h2 className="section-title">Choose Jewellery Type</h2>
                    <div className="field">
                      <label className="field-label">Type</label>
                      <PillGroup
                        list={JEWELLERY_TYPES}
                        value={form.jewelleryType}
                        onChange={(v) => setForm({ ...form, jewelleryType: v, customJewelleryType: "" })}
                      />
                    </div>
                    
                    {/* Custom Type Input - Show when "Other" is selected */}
                    {form.jewelleryType === "Other" && (
                      <div className="field">
                        <label className="field-label">Specify Your Jewellery Type</label>
                        <input
                          type="text"
                          value={form.customJewelleryType}
                          onChange={(e) => setForm({ ...form, customJewelleryType: e.target.value })}
                          placeholder="e.g., Nose Pin, Anklet, Waist Chain, etc."
                          className="textarea-input custom-input-min-height"
                          />
                        <small className="field-hint">Enter the specific type of jewellery you want to create</small>
                      </div>
                    )}
                  </div>

                  {/* Smart Material Recommendations Based on Budget */}
                  {form.budgetTier && (
                    <div className="form-section">
                      <h2 className="section-title">Recommended Materials for Your Budget</h2>
                      <div className="field-row">
                        <div className="field">
                          <label className="field-label">Metal</label>
                          <PillGroup 
                            list={METALS.filter(metal => 
                              !budgetValidation.avoid.includes(metal) || 
                              !budgetValidation.recommendations.includes(metal)
                            )} 
                            value={form.metal} 
                            onChange={(v) => setForm({ ...form, metal: v, purity: PURITY_OPTIONS[v][0] })} 
                          />
                          {budgetValidation.recommendations.includes(form.metal) && (
                            <small className="field-hint budget-friendly">✅ Budget-friendly choice</small>
                          )}
                          {budgetValidation.avoid.includes(form.metal) && (
                            <small className="field-hint budget-exceeds">⚠️ Exceeds budget</small>
                          )}
                        </div>
                        <div className="field">
                          <label className="field-label">Purity</label>
                          <PillGroup 
                            list={PURITY_OPTIONS[form.metal] || ["Standard"]} 
                            value={form.purity} 
                            onChange={(v) => setForm({ ...form, purity: v })} 
                          />
                        </div>
                        <div className="field">
                          <label className="field-label">Stone</label>
                          <PillGroup 
                            list={STONES.filter(stone => {
                              const stoneValue = stone === "Diamond" ? 25000 : 
                                               stone === "Emerald" ? 8000 :
                                               stone === "Ruby" ? 8000 :
                                               stone === "Sapphire" ? 7000 :
                                               stone === "Moissanite" ? 5000 :
                                               stone === "Pearl" ? 3000 :
                                               stone === "Opal" ? 4000 :
                                               stone === "Topaz" ? 2000 : 1000;
                              return stoneValue <= (form.budgetTier?.maxStoneValue || Infinity);
                            })} 
                            value={form.stone} 
                            onChange={(v) => setForm({ ...form, stone: v })} 
                          />
                          {form.stone !== "None" && form.budgetTier?.category === "budget" && (
                            <small className="field-hint budget-exceeds">⚠️ May exceed budget</small>
                          )}
                        </div>
                        <div className="field">
                          <label className="field-label">Finish</label>
                          <PillGroup list={FINISHES} value={form.finish} onChange={(v) => setForm({ ...form, finish: v })} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specifications based on jewellery type */}
                  {form.jewelleryType === "Ring" && (
                    <div className="form-section">
                      <h2 className="section-title">Ring Specifications</h2>
                      <div className="field">
                        <label className="field-label">Ring Size (Indian)</label>
                        <PillGroup
                          list={RING_SIZES}
                          value={form.ringSize}
                          onChange={(v) => setForm({ ...form, ringSize: v })}
                        />
                        <small className="field-hint">Standard Indian ring sizes (6–24)</small>
                      </div>
                    </div>
                  )}

                  {form.jewelleryType === "Necklace" && (
                    <div className="form-section">
                      <h2 className="section-title">Necklace Specifications</h2>
                      <div className="field">
                        <label className="field-label">Length</label>
                        <PillGroup
                          list={NECKLACE_LENGTHS}
                          value={form.necklaceLength}
                          onChange={(v) => setForm({ ...form, necklaceLength: v })}
                        />
                      </div>
                    </div>
                  )}

                  {form.jewelleryType === "Bangle" && (
                    <div className="form-section">
                      <h2 className="section-title">Bangle Specifications</h2>
                      <div className="field">
                        <label className="field-label">Size</label>
                        <PillGroup
                          list={BANGLE_SIZES}
                          value={form.bangleSize}
                          onChange={(v) => setForm({ ...form, bangleSize: v })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-section">
                    <h2 className="section-title">Occasion</h2>
                    <div className="field">
                      <label className="field-label">Occasion</label>
                      <PillGroup list={OCCASIONS} value={form.occasion} onChange={(v) => setForm({ ...form, occasion: v })} />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="button" className="primary-btn" onClick={() => setStep(3)}>
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <div className="form-section">
                    <h2 className="section-title">Weight & Measurements</h2>
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label">Approx Weight ({form.approxWeight}g)</label>
                        <input
                          type="range"
                          min="2"
                          max="25"
                          value={form.approxWeight}
                          onChange={(e) => setForm({ ...form, approxWeight: e.target.value })}
                          className="range-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h2 className="section-title">Design Description</h2>
                    <div className="field">
                      <label className="field-label">Special Requirements</label>
                      <textarea
                        rows="4"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Motifs, occasion, inspiration, budget comfort..."
                        className="textarea-input"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h2 className="section-title">Reference Image (Optional)</h2>
                    <div className="field">
                      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="file-input" />
                      {imagePreview && (
                        <div className="custom-image-preview-wrap">
                          <img src={imagePreview} alt="Reference preview" className="custom-image-preview" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
                      ← Back
                    </button>
                    <button type="button" className="primary-btn" onClick={() => setStep(4)}>
                      Review →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <>
                  <div className="review-section">
                    <h2 className="section-title">Review Your Design</h2>
                    <div className="review-grid">
                      <div className="review-card">
                        <h3>Design Summary</h3>
                        <ul className="review-list">
                          <li><strong>Type:</strong> {form.jewelleryType === "Other" ? form.customJewelleryType : form.jewelleryType}</li>
                          <li><strong>Metal:</strong> {form.metal} ({form.purity})</li>
                          <li><strong>Stone:</strong> {form.stone}</li>

                          {form.jewelleryType === "Ring" && (
                            <li><strong>Ring Size:</strong> {form.ringSize}</li>
                          )}

                          {form.jewelleryType === "Necklace" && (
                            <li><strong>Length:</strong> {form.necklaceLength}</li>
                          )}

                          <li><strong>Weight:</strong> {form.approxWeight} g</li>
                          <li><strong>Finish:</strong> {form.finish}</li>
                          <li><strong>Occasion:</strong> {form.occasion}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="review-card">
                      <h3>Live Estimate</h3>
                      <div className="estimate-display">
                        <div className="estimate-price">₹{estimate.toLocaleString("en-IN")}</div>
                        <div className="estimate-note">Indicative only</div>
                      </div>
                      <div className="estimate-note">
                        Final price will be confirmed by admin after review.
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="review-card">
                        <h3>Reference Image</h3>
                        <div className="custom-image-preview-wrap">
                          <img src={imagePreview} alt="Reference preview" className="custom-image-preview" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={() => setStep(3)}>
                      ← Back
                    </button>
                    <button 
                      type="button" 
                      className={`primary-btn ${loading ? 'button-loading button-disabled' : 'button-enabled'}`} 
                      disabled={loading} 
                      onClick={submit}
                      >
                      {loading ? (
                        <span className="button-loading-content">
                          <span className="loading-spinner-small"></span>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Design Request'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        {/* ESTIMATE SIDEBAR */}
        <aside className="estimate-sidebar">
          <div className="estimate-card">
            <h3>Live Estimate</h3>
            <div className="estimate-price">₹{estimate.toLocaleString("en-IN")}</div>
            <div className="estimate-note">Indicative only</div>
            
            {/* Budget Status */}
            {form.budgetTier && (
              <div className={`budget-status ${budgetValidation.valid ? 'within-budget' : 'over-budget'}`}>
                <div className="budget-indicator">
                  {budgetValidation.valid ? '✅ Within Budget' : '⚠️ Over Budget'}
                </div>
                <div className="budget-range">
                  Your Budget: {form.budgetTier.label}
                </div>
              </div>
            )}
          </div>
          
          <div className="estimate-details">
            <h4>Your Selection</h4>
            <ul className="selection-list">
              <li><strong>Type:</strong> {form.jewelleryType === "Other" ? form.customJewelleryType : form.jewelleryType}</li>
              <li><strong>Metal:</strong> {form.metal} ({form.purity})</li>
              <li><strong>Stone:</strong> {form.stone}</li>

              {form.jewelleryType === "Ring" && (
                <li><strong>Ring Size:</strong> {form.ringSize}</li>
              )}

              {form.jewelleryType === "Necklace" && (
                <li><strong>Length:</strong> {form.necklaceLength}</li>
              )}

              <li><strong>Weight:</strong> {form.approxWeight} g</li>
              <li><strong>Finish:</strong> {form.finish}</li>
              <li><strong>Occasion:</strong> {form.occasion}</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ================= INDUSTRY-LEVEL CSS STYLING ================= */
const styles = `
/* Page Container */
.custom-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.custom-breadcrumb {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem 0;
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.custom-breadcrumb a {
  text-decoration: none;
}

.custom-inline-message {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid transparent;
}

.custom-inline-message-error {
  background: #fff3f1;
  border-color: #f2c5bd;
}

.custom-inline-message-success {
  background: #eef8f0;
  border-color: #bfdcc5;
}

.custom-image-preview-wrap {
  margin-top: 1rem;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ece6dc;
}

.custom-image-preview {
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: cover;
}

/* Header Section */
.page-header {
  text-align: center;
  padding: 4rem 2rem 3rem;
  background: linear-gradient(135deg, #d4af37 0%, #c9a44c 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-kicker {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header p {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Main Layout */
.custom-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
}

/* Form Container */
.form-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  overflow: hidden;
}

.custom-form {
  padding: 3rem;
}

/* Form Sections */
.form-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #d4af37, #c9a44c);
  border-radius: 2px;
}

/* Field Styling */
.field {
  margin-bottom: 2rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Pill Button Groups */
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pill-toggle {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pill-toggle:hover {
  border-color: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

.pill-toggle.active {
  border-color: #d4af37;
  color: white;
  background: linear-gradient(135deg, #d4af37, #c9a44c);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
}

/* Input Styling */
.range-input {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #c9a44c);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.textarea-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: #fafafa;
}

.textarea-input:focus {
  outline: none;
  border-color: #d4af37;
  background: white;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
}

.file-input {
  width: 100%;
  padding: 1rem;
  border: 2px dashed #d4af37;
  border-radius: 12px;
  background: #fafafa;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-input:hover {
  background: white;
  border-style: solid;
}

/* Button Styling */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #d4af37, #c9a44c);
  color: white;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.secondary-btn:hover {
  border-color: #d4af37;
  color: #d4af37;
  transform: translateY(-2px);
}

/* Estimate Sidebar */
.estimate-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.estimate-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f0;
}

.estimate-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estimate-card h3::before {
  content: '💎';
  font-size: 1.5rem;
}

.estimate-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #d4af37, #c9a44c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.estimate-note {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 1rem;
}

.estimate-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.selection-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selection-list li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-list li strong {
  color: #374151;
  font-weight: 600;
}

/* Review Section */
.review-section {
  background: #fafafa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.review-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.review-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.review-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.review-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-list li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  border-bottom: 1px solid #f0f0f0;
}

.review-list li:last-child {
  border-bottom: none;
}

.review-list li strong {
  color: #374151;
  font-weight: 600;
}

.estimate-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #faf8f5, #f5f3f0);
  border-radius: 12px;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .custom-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .estimate-sidebar {
    position: static;
    order: -1;
  }
  
  .custom-form {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 3rem 1.5rem 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .custom-layout {
    padding: 2rem 1rem;
  }
  
  .custom-form {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .pill-group {
    gap: 0.5rem;
  }
  
  .pill-toggle {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

/* Loading States */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Success Message */
.custom-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Field Row for Multiple Fields */
.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* Premium Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  animation: fadeIn 0.6s ease-out;
}

/* Premium Hover Effects */
.estimate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.12);
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

/* Budget Validation Styles */
.budget-validation-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
}

.budget-warning {
  color: #dc2626;
  font-size: 0.875rem;
  line-height: 1.4;
}

.budget-warning strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

/* Budget Status in Sidebar */
.budget-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.budget-status.within-budget {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  color: #166534;
}

.budget-status.over-budget {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  color: #dc2626;
}

.budget-indicator {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.budget-range {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Enhanced Field Row Layout */
.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

/* Enhanced Pill Buttons */
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill-toggle {
  padding: 0.625rem 1.25rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-toggle:hover {
  border-color: #d4af37;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(212, 175, 55, 0.15);
}

.pill-toggle.active {
  border-color: #d4af37;
  color: white;
  background: linear-gradient(135deg, #d4af37, #c9a44c);
  box-shadow: 0 3px 12px rgba(212, 175, 55, 0.25);
}

/* Enhanced Form Sections */
.form-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
}

.form-section:hover {
  border-color: #e5e7eb;
  transition: all 0.3s ease;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #d4af37, #c9a44c);
  border-radius: 2px;
}

/* Enhanced Field Styling */
.field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-style: italic;
  line-height: 1.3;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .field-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .pill-group {
    gap: 0.375rem;
  }
  
  .pill-toggle {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    min-height: 32px;
  }
  
  .form-section {
    padding: 1rem;
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 1.125rem;
  }
}

/* Premium Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.budget-validation-message {
  animation: slideIn 0.3s ease-out;
}

/* Enhanced Success Message */
.custom-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: fadeIn 0.5s ease-out;
}

/* Enhanced Button States */
.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  color: #9ca3af;
  border-color: #e5e7eb;
}

/* Purpose Suggestions Styling */
.purpose-suggestions {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.suggestion-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 1rem;
  text-align: center;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.suggestion-card h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.suggestion-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-card li {
  padding: 0.25rem 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
}

.suggestion-card p {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

/* Budget Recommendations Styling */
.budget-recommendations {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #fbbf24;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.recommendation-card.recommended {
  border: 1px solid #bbf7d0;
}

.recommendation-card.avoid {
  border: 1px solid #fecaca;
}

.recommendation-card h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.recommendation-card.recommended h4 {
  color: #166534;
}

.recommendation-card.avoid h4 {
  color: #dc2626;
}

.recommendation-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-card li {
  padding: 0.25rem 0;
  font-size: 0.8rem;
  line-height: 1.3;
}

.recommendation-card.recommended li {
  color: #166534;
}

.recommendation-card.avoid li {
  color: #dc2626;
  text-decoration: line-through;
}

.budget-tip {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
}

/* Smart Material Indicators */
.field-hint.budget-friendly {
  color: #166534 !important;
  font-weight: 600;
}

.field-hint.budget-warning {
  color: #dc2626 !important;
  font-weight: 600;
}

/* Enhanced Responsive Design */
@media (max-width: 768px) {
  .suggestion-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
  
  .purpose-suggestions,
  .budget-recommendations {
    padding: 1rem;
  }
}
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
  const existingStyleSheet = document.getElementById("custom-design-form-styles");

  if (!existingStyleSheet) {
    const styleSheet = document.createElement('style');
    styleSheet.id = "custom-design-form-styles";
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
}

// import React, { useEffect, useMemo, useState } from "react";
// import API from "../../services/api";
// import { useNavigate } from "react-router-dom";

// /* ================= CONSTANTS ================= */

// const JEWELLERY_CATEGORIES = {
//   CORE: "Everyday Core Jewellery",
//   EAR: "Ear Jewellery",
//   BRIDAL: "Bridal Jewellery",
//   FOOT: "Foot Jewellery",
//   RELIGIOUS: "Religious / Cultural Jewellery",
//   MEN: "Men’s Jewellery",
// };

// const JEWELLERY_OPTIONS = {
//   [JEWELLERY_CATEGORIES.CORE]: [
//     "Ring",
//     "Necklace / Chain",
//     "Earrings",
//     "Bangle / Kada",
//     "Bracelet",
//     "Pendant",
//   ],
//   [JEWELLERY_CATEGORIES.EAR]: ["Stud", "Hoop", "Drop", "Jhumka"],
//   [JEWELLERY_CATEGORIES.BRIDAL]: ["Bridal Necklace Set", "Choker"],
//   [JEWELLERY_CATEGORIES.FOOT]: ["Payal", "Toe Ring"],
//   [JEWELLERY_CATEGORIES.RELIGIOUS]: ["Rudraksha Pendant", "Navratna Jewellery" , "Om",
  
//   "Temple Motif",
//   "Custom Symbol",],
//   [JEWELLERY_CATEGORIES.MEN]: ["Men’s Ring", "Kada", "Chain"]};

// const METALS = ["Gold", "Silver"];
// const PURITIES = ["22K", "18K", "925"];
// const STONES = ["None", "Diamond", "Emerald", "Ruby", "Sapphire"];
// const FINISHES = ["Matte", "Glossy", "Antique"];
// const OCCASIONS = ["Daily Wear", "Engagement", "Wedding"];

// const RING_SIZES = Array.from({ length: 19 }, (_, i) => i + 6);
// const NECKLACE_LENGTHS = ["14 in", "16 in", "18 in", "20 in"];
// const BANGLE_SIZES = ["2-2", "2-4", "2-6", "2-8"];
// const EARRING_TYPES = ["Stud", "Hoop", "Drop", "Jhumka", "Ear Cuff"];
// const BRACELET_LENGTHS = ["6 in", "6.5 in", "7 in", "7.5 in", "8 in"];
// const PENDANT_STYLES = ["Minimal", "Religious", "Heart", "Floral", "Custom"];
// const EARRING_SIZES = ["Small", "Medium", "Large"];
// const DRAFT_KEY = "customDesignDraft";
// const BRIDAL_SET_TYPES = ["Single Piece", "Pair", "Full Set"];
// const PAYAL_LENGTHS = ["9 in", "9.5 in", "10 in", "10.5 in"];
// const TOE_RING_SIZES = ["Free Size", "Adjustable"];
// const RELIGIOUS_THEMES = [
//  "free size","Adjustable"
// ];
// const MENS_STYLES = ["Minimal", "Bold", "Traditional", "Modern"];


// /* ================= COMPONENT ================= */

// export default function CustomDesignForm() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     category: JEWELLERY_CATEGORIES.CORE,
//     jewelleryType: "Ring",
//     ringSize: 12,
//     necklaceLength: "18 in",
//     bangleSize: "2-6",
//     metal: "Gold",
//     purity: "22K",
//     stone: "Diamond",
//     finish: "Glossy",
//     occasion: "Daily Wear",
//     approxWeight: 5,
  
// braceletLength: "7 in",
// earringType: "Stud",
// bridalSetType: "Single Piece",
// payalLength: "10 in",
// toeRingSize: "Adjustable",
// religiousTheme: "Om",
// mensStyle: "Minimal",

// pendantStyle: "Minimal",

//     description: "",
//   });

//   /* ========= AUTO SAVE (BACKGROUND) ========= */
//   useEffect(() => {
//     localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
//   }, [form]);

//   useEffect(() => {
//     const saved = localStorage.getItem(DRAFT_KEY);
//     if (saved) setForm(JSON.parse(saved));
//   }, []);

//   /* ========= ESTIMATE ========= */
//   const estimate = useMemo(() => {
//     const base = 30000;
//     const purityFactor = form.purity === "22K" ? 1.3 : 1.15;
//     const stoneFactor = form.stone === "Diamond" ? 1.7 : 1;
//     return Math.round(base * purityFactor * stoneFactor * (form.approxWeight / 5));
//   }, [form]);

//   /* ========= SUBMIT ========= */
//   const submit = async () => {
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//       if (image) fd.append("referenceImage", image);

//       await API.post("/custom-design", fd);
//       localStorage.removeItem(DRAFT_KEY);
//       navigate("/my-custom-designs");
//     } catch {
//       alert("Submission failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ========= UI HELPER ========= */
//   const PillGroup = ({ list, value, onChange }) => (
//     <div className="pill-group">
//       {list.map((v) => (
//         <button
//           key={v}
//           type="button"
//           className={`pill-toggle ${value === v ? "active" : ""}`}
//           onClick={() => onChange(v)}
//         >
//           {v}
//         </button>
//       ))}
//     </div>
//   );

//   return (
//     <div className="custom-page">
//       <header className="page-header">
//         <p className="hero-kicker">PARIVA Studio</p>
//         <h1>Custom Jewellery Design</h1>
//         <p>Create jewellery exactly the way you imagine it.</p>

//         {/* MINIMAL STEP TEXT */}
//         <p style={{ marginTop: 10, color: "#c9a44c" }}>
//           Step {step} of 4
//         </p>
//       </header>

//       <section className="custom-layout">
//         <form className="custom-form">

//           {/* STEP 1 */}
//           {step === 1 && (
//             <>
//               <label>Jewellery Category</label>
//               <PillGroup
//                 list={Object.values(JEWELLERY_CATEGORIES)}
//                 value={form.category}
//                 onChange={(v) => setForm({ ...form, category: v })}
//               />

//               <label>Jewellery Type</label>
//               <PillGroup
//                 list={JEWELLERY_OPTIONS[form.category]}
//                 value={form.jewelleryType}
//                 onChange={(v) => setForm({ ...form, jewelleryType: v })}
//               />

//               <button type="button" onClick={() => setStep(2)}>
//                 Next →
//               </button>
//             </>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//   <>
//     {/* RING */}
//     {form.jewelleryType === "Ring" && (
//       <PillGroup
//         list={RING_SIZES}
//         value={form.ringSize}
//         onChange={(v) => setForm({ ...form, ringSize: v })}
//       />
//     )}

//     {/* NECKLACE / CHAIN */}
//     {form.jewelleryType === "Necklace / Chain" && (
//       <PillGroup
//         list={NECKLACE_LENGTHS}
//         value={form.necklaceLength}
//         onChange={(v) =>
//           setForm({ ...form, necklaceLength: v })
//         }
//       />
//     )}

  
//     {/* EAR JEWELLERY */}
//     {form.category === "Ear Jewellery" && (
//       <>
//         <label>Earring Type</label>
//         <PillGroup
//           list={EARRING_TYPES}
//           value={form.earringType}
//           onChange={(v) => setForm({ ...form, earringType: v })}
//         />
//       </>
//     )}

//     {/* BRIDAL JEWELLERY */}
//     {form.category === "Bridal Jewellery" && (
//       <>
//         <label>Set Type</label>
//         <PillGroup
//           list={BRIDAL_SET_TYPES}
//           value={form.bridalSetType}
//           onChange={(v) =>
//             setForm({ ...form, bridalSetType: v })
//           }
//         />
//       </>
//     )}

//     {/* FOOT JEWELLERY */}
//     {form.category === "Foot Jewellery" && (
//       <>
//         {form.jewelleryType === "Payal" && (
//           <PillGroup
//             list={PAYAL_LENGTHS}
//             value={form.payalLength}
//             onChange={(v) =>
//               setForm({ ...form, payalLength: v })
//             }
//           />
//         )}

//         {form.jewelleryType === "Toe Ring" && (
//           <PillGroup
//             list={TOE_RING_SIZES}
//             value={form.toeRingSize}
//             onChange={(v) =>
//               setForm({ ...form, toeRingSize: v })
//             }
//           />
//         )}
//       </>
//     )}

//     {/* RELIGIOUS / CULTURAL */}
//     {form.category === "Religious / Cultural Jewellery" && (
//       <>
//         <label>Religious Theme</label>
//         <PillGroup
//           list={RELIGIOUS_THEMES}
//           value={form.religiousTheme}
//           onChange={(v) =>
//             setForm({ ...form, religiousTheme: v })
//           }
//         />
//       </>
//     )}

//     {/* MEN'S JEWELLERY */}
//     {form.category === "Men’s Jewellery" && (
//       <>
//         <label>Style Preference</label>
//         <PillGroup
//           list={MENS_STYLES}
//           value={form.mensStyle}
//           onChange={(v) =>
//             setForm({ ...form, mensStyle: v })
//           }
//         />
//       </>
//     )}

  


//     {/* BANGLE / KADA */}
//     {form.jewelleryType === "Bangle / Kada" && (
//       <PillGroup
//         list={BANGLE_SIZES}
//         value={form.bangleSize}
//         onChange={(v) =>
//           setForm({ ...form, bangleSize: v })
//         }
//       />
//     )}

//     {/* BRACELET */}
//     {form.jewelleryType === "Bracelet" && (
//       <PillGroup
//         list={BRACELET_LENGTHS}
//         value={form.braceletLength}
//         onChange={(v) =>
//           setForm({ ...form, braceletLength: v })
//         }
//       />
//     )}

//     {/* PENDANT */}
//     {form.jewelleryType === "Pendant" && (
//       <PillGroup
//         list={PENDANT_STYLES}
//         value={form.pendantStyle}
//         onChange={(v) =>
//           setForm({ ...form, pendantStyle: v })
//         }
//       />
//     )}

//     <button type="button" onClick={() => setStep(1)}>← Back</button>
//     <button type="button" onClick={() => setStep(3)}>Next →</button>
//   </>
// )}


//           {/* STEP 3 */}
//           {step === 3 && (
//             <>
//               <PillGroup list={METALS} value={form.metal}
//                 onChange={(v) => setForm({ ...form, metal: v })} />

//               <PillGroup list={PURITIES} value={form.purity}
//                 onChange={(v) => setForm({ ...form, purity: v })} />

//               <PillGroup list={STONES} value={form.stone}
//                 onChange={(v) => setForm({ ...form, stone: v })} />

//               <PillGroup list={FINISHES} value={form.finish}
//                 onChange={(v) => setForm({ ...form, finish: v })} />

//               <textarea
//                 placeholder="Describe your design..."
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm({ ...form, description: e.target.value })
//                 }
//               />

//               <button type="button" onClick={() => setStep(2)}>← Back</button>
//               <button type="button" onClick={() => setStep(4)}>Review →</button>
//             </>
//           )}

//           {/* STEP 4 */}
//           {step === 4 && (
//             <>
//               <h3>Estimated Price: ₹{estimate.toLocaleString("en-IN")}</h3>

//               <input
//                 type="file"
//                 onChange={(e) => setImage(e.target.files[0])}
//               />

//               <button type="button" onClick={() => setStep(3)}>← Back</button>
//               {step === 4 && (
//   <button
//     className="hero-cta primary-cta"
//     disabled={loading}
//     onClick={submit}
//   >
//     {loading ? "Submitting..." : "Submit Design Request"}
//   </button>
// )}

//             </>
//           )}
//         </form>
//       </section>
//       <aside className="custom-summary">
//          <div className="summary-card">
//            <div className="live-summary">
//   <h4>Your Selection</h4>
//   <ul>
//     <li><b>Category:</b> {form.category}</li>
//     <li><b>Type:</b> {form.jewelleryType}</li>

//     {form.jewelleryType === "Ring" && (
//       <li><b>Ring Size:</b> {form.ringSize}</li>
//     )}

//     {(form.jewelleryType === "Earrings" ||
//       form.category === JEWELLERY_CATEGORIES.EAR) && (
//       <li><b>Earring Type:</b> {form.earringType}</li>
//     )}

//     {form.jewelleryType === "Necklace / Chain" && (
//       <li><b>Length:</b> {form.necklaceLength}</li>
//     )}

//     {form.jewelleryType === "Bangle / Kada" && (
//       <li><b>Bangle Size:</b> {form.bangleSize}</li>
//     )}

//     <li><b>Metal:</b> {form.metal}</li>
//     <li><b>Purity:</b> {form.purity}</li>
//     <li><b>Stone:</b> {form.stone}</li>
//     <li><b>Finish:</b> {form.finish}</li>
//     <li><b>Occasion:</b> {form.occasion}</li>
//   </ul>
// </div>

//           </div>
//         </aside>
//     </div>
//   );
// }
