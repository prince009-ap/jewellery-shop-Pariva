import mongoose from "mongoose";

const budgetRuleSchema = new mongoose.Schema({
  // Budget range
  budgetRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    label: { type: String, required: true }
  },
  
  // Material restrictions
  allowedMetals: [{
    type: String,
    enum: ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold", "Brass", "Copper", "Alloy", "Stainless Steel"]
  }],
  allowedPurities: [{
    type: String
  }],
  allowedStones: [{
    type: String,
    enum: ["None", "Diamond", "Emerald", "Ruby", "Sapphire", "Moissanite", "Pearl", "Opal", "Topaz"]
  }],
  
  // Weight restrictions
  maxWeight: { type: Number, default: null },
  minWeight: { type: Number, default: null },
  
  // Product type restrictions
  allowedCategories: [{
    type: String,
    enum: ["Ring", "Necklace", "Bangle", "Bracelet", "Earrings", "Pendant", "Chain", "Other"]
  }],
  
  // Suggestions when exceeding budget
  suggestions: [{
    type: String
  }],
  
  // Priority (higher = more important)
  priority: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Admin tracking
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

// Index for efficient budget matching
budgetRuleSchema.index({ isActive: 1, priority: -1 });
budgetRuleSchema.index({ "budgetRange.min": 1, "budgetRange.max": 1 });

export default mongoose.model("BudgetRule", budgetRuleSchema);
