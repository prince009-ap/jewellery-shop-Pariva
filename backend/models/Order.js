import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        image: String,
        price: Number,
        qty: Number,
      },
    ],

    // Full shipping address snapshot at order time
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    priceBreakup: {
      goldValue: { type: Number, required: true },
      makingCharge: { type: Number, required: true },
      stoneCharge: { type: Number, required: true },
      gst: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },

    // Payment information
    payment: {
      method: { type: String, enum: ["cod", "razorpay"], default: "cod" },
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      paidAt: Date,
    },

    // Order status with validation
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Invoice information
    invoice: {
      generated: { type: Boolean, default: false },
      filename: String,
      path: String,
      generatedAt: Date,
    },

    // Email tracking
    email: {
      confirmationSent: { type: Boolean, default: false },
      sentAt: Date,
      error: String,
    },

    // Automatic tracking history
    trackingHistory: [
      {
        status: { type: String, required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Auto-add tracking history when order status changes
orderSchema.pre("save", function(next) {
  if (this.isModified("orderStatus") && !this.isNew) {
    const statusMessages = {
      pending: "Order placed successfully",
      confirmed: "Order confirmed and being processed",
      shipped: "Order has been shipped",
      delivered: "Order delivered successfully",
      cancelled: "Order has been cancelled",
    };

    this.trackingHistory.push({
      status: this.orderStatus,
      message: statusMessages[this.orderStatus] || `Order status updated to ${this.orderStatus}`,
      date: new Date(),
    });
  }
});

// Method to update order status with history
orderSchema.methods.updateStatus = function(status, message) {
  this.orderStatus = status;
  this.trackingHistory.push({
    status,
    message: message || `Order status updated to ${status}`,
    date: new Date(),
  });
  return this.save();
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
