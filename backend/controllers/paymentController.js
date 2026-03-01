import razorpayConfig from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import { generateInvoice } from "../utils/generateInvoice.js";
import { sendMail } from "../utils/sendMail.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to fetch and validate address
const fetchAddress = async (addressId) => {
  try {
    const address = await Address.findById(addressId);
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  } catch (error) {
    console.error("❌ Error fetching address:", error);
    throw error;
  }
};

// Helper function to generate and save invoice
const generateAndSaveInvoice = async (order) => {
  try {
    console.log("📄 Generating invoice for order:", order._id);
    
    // Generate invoice PDF
    const invoiceBuffer = await generateInvoice(order);
    
    // Create invoice filename
    const invoiceFilename = `invoice_${order._id}_${Date.now()}.pdf`;
    const invoicePath = path.join(process.cwd(), "uploads/invoices", invoiceFilename);
    
    // Ensure invoices directory exists
    const invoicesDir = path.dirname(invoicePath);
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    
    // Save invoice file
    fs.writeFileSync(invoicePath, invoiceBuffer);
    
    // Update order with invoice info
    order.invoice.generated = true;
    order.invoice.filename = invoiceFilename;
    order.invoice.path = invoicePath;
    order.invoice.generatedAt = new Date();
    
    console.log("📄 Invoice saved:", invoicePath);
    return invoicePath;
  } catch (error) {
    console.error("❌ Invoice generation failed:", error);
    throw error;
  }
};

// Helper function to send confirmation email with retry
const sendConfirmationEmail = async (order, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Sending email (attempt ${attempt}/${maxRetries})...`);
      
      const emailContent = {
        to: order.shippingAddress.email,
        subject: `Order Confirmation - PARIVA Jewellery (${order._id})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d4af37; color: white; padding: 20px; text-align: center;">
              <h1>PARIVA Jewellery</h1>
              <p>Order Confirmation</p>
            </div>
            <div style="padding: 20px;">
              <h2>Thank you for your order!</h2>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Status:</strong> ${order.orderStatus.toUpperCase()}</p>
              <p><strong>Total Amount:</strong> ₹${order.priceBreakup.totalAmount}</p>
              
              <h3>Shipping Address:</h3>
              <p>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                ${order.shippingAddress.pincode}<br>
                ${order.shippingAddress.country}<br>
                📞 ${order.shippingAddress.phone}<br>
                📧 ${order.shippingAddress.email}
              </p>
              
              <h3>Order Items:</h3>
              ${order.items.map(item => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.qty}<br>
                  Price: ₹${item.price}
                </div>
              `).join('')}
              
              <p style="margin-top: 20px; color: #666;">
                Your order will be delivered within 5-7 working days.<br>
                You can track your order status in your account.
              </p>
            </div>
            <div style="background: #f5f5f5; padding: 15px; text-align: center; color: #666;">
              <p>© 2024 PARIVA Jewellery. All rights reserved.</p>
            </div>
          </div>
        `,
        attachments: order.invoice.generated ? [{
          filename: order.invoice.filename,
          path: order.invoice.path
        }] : []
      };
      
      await sendMail(emailContent);
      
      // Update email tracking
      order.email.confirmationSent = true;
      order.email.sentAt = new Date();
      order.email.error = null;
      
      console.log("📧 Email sent successfully");
      return true;
      
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        order.email.error = error.message;
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// GET Razorpay public key
export const getRazorpayKey = async (req, res) => {
  try {
    if (!razorpayConfig.isConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured"
      });
    }

    res.json({
      success: true,
      key: razorpayConfig.getPublicKey(),
      mode: razorpayConfig.getMode()
    });
  } catch (error) {
    console.error("Error fetching Razorpay key:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment key"
    });
  }
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    console.log("💳 Creating Razorpay order request");
    
    const { amount, currency = "INR" } = req.body;

    console.log("📊 Order request data:", { amount, currency });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const razorpay = razorpayConfig.getInstance();
    
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        created_at: new Date().toISOString()
      }
    });

    console.log("✅ Razorpay order created:", order);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
};

// Verify payment signature - Production Grade
export const verifyPayment = async (req, res) => {
  try {
    console.log("🔍 Payment verification started");
    console.log("🔧 Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING"
    });
    
    console.log("📦 Full request body:", JSON.stringify(req.body, null, 2));
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    console.log("📥 Verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      has_signature: !!razorpay_signature,
      has_orderData: !!orderData,
      orderData_keys: orderData ? Object.keys(orderData) : null
    });

    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ Missing required parameters");
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
        received: { razorpay_order_id, razorpay_payment_id, has_signature: !!razorpay_signature }
      });
    }

    // Verify signature
    const signatureString = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("🔐 Signature creation:", {
      secret_used: process.env.RAZORPAY_KEY_SECRET ? "YES" : "NO",
      string_to_hash: signatureString,
      secret_length: process.env.RAZORPAY_KEY_SECRET?.length || 0
    });
    
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureString)
      .digest("hex");

    console.log("🔐 Signature verification:", {
      expected: sign,
      received: razorpay_signature,
      valid: sign === razorpay_signature,
      strings_match: signatureString === (razorpay_order_id + "|" + razorpay_payment_id)
    });

    if (sign !== razorpay_signature) {
      console.log("❌ Signature mismatch - SECURITY BREACH ATTEMPT");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
        debug: {
          expected: sign,
          received: razorpay_signature,
          string_used: signatureString
        }
      });
    }

    console.log("✅ Signature verified successfully");

    // Check for duplicate payment (idempotent verification)
    console.log("🔍 Checking for duplicate orders...");
    const existingOrder = await Order.findOne({
      "payment.razorpay_order_id": razorpay_order_id,
      "payment.razorpay_payment_id": razorpay_payment_id
    });

    if (existingOrder) {
      console.log("⚠️ Duplicate payment attempt:", existingOrder._id);
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
        existingOrderId: existingOrder._id
      });
    }

    // Validate user and fetch cart data (don't trust frontend)
    if (!req.user?.id) {
      console.log("❌ User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

   

    // Fetch and validate shipping address
    if (!orderData?.shippingAddress) {
      console.log("❌ Missing shipping address ID");
      return res.status(400).json({
        success: false,
        message: "Shipping address required"
      });
    }

    console.log("🏠 Fetching shipping address...");
    const address = await Address.findById(orderData.shippingAddress);
console.log("ADDRESS FROM DB 👉", address);
if (!address) {
  return res.status(400).json({
    success: false,
    message: "Invalid address"
  });
}
console.log("FINAL SHIPPING OBJECT 👉", {
  name: address.label,
  phone: address.phone,
  city: address.city,
  state: address.state,
  pincode: address.pincode,
});
    // Create order with full data validation
    console.log("💾 Creating order with validated data...");
    const order = new Order({
      user: req.user._id,
      ...orderData,
      items: orderData.items.map(item => ({
  product: item.product,
  name: item.name,
  image: item.image,
  price: item.price,
  qty: item.qty
})),
      shippingAddress: {
  name: req.user.name,  // ✅ FIX - Use user.name instead of address.label
  email: req.user.email,
  phone: address.phone || req.user.mobile || "",
  address: [
    address.house,
    address.floor,
    address.area,
    address.landmark
  ].filter(Boolean).join(", "),
  city: address.city,
  state: address.state,
  pincode: address.pincode,
},  
      priceBreakup: {
        goldValue: orderData.priceBreakup?.goldValue || 0,
        makingCharge: orderData.priceBreakup?.makingCharge || 0,
        stoneCharge: orderData.priceBreakup?.stoneCharge || 0,
        gst: orderData.priceBreakup?.gst || 0,
        totalAmount: orderData.priceBreakup?.totalAmount || 0
      },
      payment: {
        method: "razorpay",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        paidAt: new Date()
      },
      orderStatus: "confirmed", // Auto-confirm on successful payment
      trackingHistory: [
        {
          status: "pending",
          message: "Order placed successfully",
          date: new Date()
        },
        {
          status: "confirmed", 
          message: "Payment confirmed and order processed",
          date: new Date()
        }
      ]
    });

    console.log("🛠 Creating Order Object:", order);
    if (!order.invoice) order.invoice = {};
    if (!order.email) order.email = {};
    console.log("💾 Attempting to save order...");
    await order.save();
    console.log("🧾 Saved Order Payment Object:", order.payment);
    console.log("✅ Order saved successfully:", order._id);

    // Generate invoice (non-blocking)
    let invoicePath = null;
    try {
      invoicePath = await generateAndSaveInvoice(order);
      console.log("📄 Invoice generated and saved");
    } catch (invoiceError) {
      console.error("⚠️ Invoice generation failed:", invoiceError.message);
      // Don't fail the order if invoice fails
    }

    // Clear user's cart (atomic operation)
    console.log("� Clearing cart for user:", req.user.id);
    const cartUpdate = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalAmount: 0 },
      { new: true }
    );
    console.log("🛒 Cart cleared:", cartUpdate ? "SUCCESS" : "FAILED");

    // Send confirmation email (non-blocking with retry)
    try {
      await sendConfirmationEmail(order);
      console.log("📧 Confirmation email sent successfully");
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError.message);
      // Don't fail the order if email fails
    }

    // Save final order state with email/invoice tracking
    await order.save();

    console.log("🎉 Payment verification completed successfully");

    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
      orderStatus: order.orderStatus,
      invoiceGenerated: order.invoice.generated,
      emailSent: order.email.confirmationSent
    });

  } catch (error) {
    console.error("❌ CRITICAL ERROR in verifyPayment:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
      debug: {
        errorName: error.name,
        errorCode: error.code,
        timestamp: new Date().toISOString()
      }
    });
  }
};
