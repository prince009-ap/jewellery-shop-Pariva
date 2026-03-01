import mongoose from "mongoose";

const engravingSettingSchema = new mongoose.Schema({
  isEngravingEnabled: {
    type: Boolean,
    default: true
  },
  pricePerCharacter: {
    type: Number,
    default: 10
  },
  maxCharacterLimit: {
    type: Number,
    default: 20
  },
  allowEmoji: {
    type: Boolean,
    default: true
  },
  allowedCharacters: {
    letters: { type: Boolean, default: true },
    numbers: { type: Boolean, default: true },
    specialChars: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.model("EngravingSetting", engravingSettingSchema);
