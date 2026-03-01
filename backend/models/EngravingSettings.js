import mongoose from "mongoose";

const engravingSettingsSchema = new mongoose.Schema({
  // Engraving availability
  freeEngraving: {
    type: Boolean,
    default: false
  },
  
  // Pricing
  pricePerCharacter: {
    type: Number,
    default: 50,
    min: 0
  },
  maxFreeCharacters: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Character limits
  characterLimit: {
    type: Number,
    default: 20,
    min: 1,
    max: 100
  },
  
  // Allowed characters
  allowedCharacters: {
    letters: { type: Boolean, default: true },
    numbers: { type: Boolean, default: true },
    spaces: { type: Boolean, default: true },
    specialChars: { type: Boolean, default: false },
    emojis: { type: Boolean, default: false }
  },
  
  // Custom character set
  customAllowedChars: {
    type: String,
    default: ""
  },
  
  // Product-specific settings
  applicableToCategories: [{
    type: String,
    enum: ["Ring", "Necklace", "Bracelet", "Bangle", "Pendant", "Earrings", "Chain", "All"]
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Admin tracking
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}, { timestamps: true });

// Singleton pattern - only one settings document
engravingSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("EngravingSettings", engravingSettingsSchema);
