import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

class RazorpayConfig {
  constructor() {
    this.instance = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      return this.instance;
    }

    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID missing in .env");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET missing in .env");
    }

    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    this.isInitialized = true;
    return this.instance;
  }

  getInstance() {
    if (!this.isInitialized) {
      return this.init();
    }
    return this.instance;
  }

  getPublicKey() {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID missing in .env");
    }
    return process.env.RAZORPAY_KEY_ID;
  }

  isConfigured() {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  getMode() {
    return process.env.RAZORPAY_MODE || 'test';
  }
}

const razorpayConfig = new RazorpayConfig();
export default razorpayConfig;
