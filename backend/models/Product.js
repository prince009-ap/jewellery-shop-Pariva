import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    metal: { type: String, required: true }, // Gold, Silver
    purity: { type: String, required: true }, // 22K, 18K, 14K
    occasion: { type: String, required: true }, // Wedding, Daily Wear, Party
    price: { type: Number, required: true },
    weight: { type: Number, required: true }, // Weight in grams
    description: { type: String, default: "" },
    
    // Images
    image: { type: String, required: true }, // Main image path
    images: [{ type: String }], // Additional images array
    
    // Pricing details
    makingChargePercent: {
      type: Number,
      default: 12
    },
    stonePrice: {
      type: Number,
      default: 0
    },
    
    // Status flags
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    
    // Stock and availability
    stock: {
      type: Number,
      required: true,
      default: 50,
    },
    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "made_to_order"],
      default: "in_stock"
    },

    // Product details
    sku: { type: String, unique: true, required: true },
    shortDescription: { type: String, default: "" },
    
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    
    // Review and Rating fields
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Timestamps for tracking
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Generate SKU before saving
productSchema.pre("save", function(next) {
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${categoryCode}${randomNum}`;
  }
});
export default mongoose.models.Product || mongoose.model("Product", productSchema);
