import mongoose from "mongoose";

const budgetRuleSchema = new mongoose.Schema({
  budgetRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    label: { type: String, required: true }
  },
  allowedMaterials: [{
    type: String,
    enum: ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold", "Yellow Gold"]
  }],
  suggestedCategories: [{
    type: String,
    enum: ["Ring", "Necklace", "Bracelet", "Pendant", "Earrings", "Bangles"]
  }],
  suggestions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model("BudgetRule", budgetRuleSchema);
