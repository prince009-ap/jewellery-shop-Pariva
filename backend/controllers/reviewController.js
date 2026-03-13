import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// 🛡️ Helper function to sanitize HTML
const sanitizeComment = (comment) => {
  if (!comment) return "";
  return comment
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
};

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === "object") {
    if (value._id) return normalizeObjectId(value._id);
    if (value.id) return normalizeObjectId(value.id);
  }
  return String(value);
};

// 📝 CREATE REVIEW - Main business logic
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user?.id;
    const normalizedProductId = normalizeObjectId(productId);
    const normalizedOrderId = normalizeObjectId(orderId);

    console.log("📝 Review submission:", { userId, productId, orderId, rating, comment });

    // 🔍 VALIDATION 1: Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login to submit a review."
      });
    }

    // 🔍 VALIDATION 2: Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars."
      });
    }

    // 🔍 VALIDATION 3: Validate comment
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty."
      });
    }

    if (comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot exceed 1000 characters."
      });
    }

    // 🔍 VALIDATION 4: Check if product exists
    const product = await Product.findById(normalizedProductId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // 🔍 VALIDATION 5: Check if order exists and belongs to user
    const order = await Order.findOne({ 
      _id: normalizedOrderId, 
      user: userId 
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    // 🔍 VALIDATION 6: Check if order belongs to logged-in user
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own orders."
      });
    }

    // 🔍 VALIDATION 7: Check if order status is "Delivered" (BUSINESS RULE)
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "You can only review products from delivered orders. Current status: " + order.orderStatus
      });
    }
// 🔍 VALIDATION 8: Check if product exists in this order
const productInOrder = order.items.some(item => {
  const itemProductId = normalizeObjectId(item.product);
  return itemProductId === normalizedProductId;
});

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: "This product was not found in your order."
      });
    }

    // 🔍 VALIDATION 9: Check for duplicate review
    const existingReview = await Review.findOne({
      userId,
      productId: normalizedProductId,
      orderId: normalizedOrderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product from this order."
      });
    }

    // ✅ CREATE THE REVIEW
    const sanitizedComment = sanitizeComment(comment);
    
    const review = await Review.create({
      userId,
      productId: normalizedProductId,
      orderId: normalizedOrderId,
      rating: parseInt(rating),
      comment: sanitizedComment
    });

    console.log("✅ Review created successfully:", review._id);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: review
    });

  } catch (error) {
    console.error("❌ Review creation error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product from this order."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit review. Please try again.",
      error: error.message
    });
  }
};

// 📖 GET REVIEWS FOR A PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    // Get reviews with pagination
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('rating comment createdAt userId');

    const total = await Review.countDocuments({ productId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNextPage: page * limit < total
        },
        productInfo: {
          name: product.name,
          averageRating: product.averageRating || 0,
          totalReviews: product.totalReviews || 0
        }
      }
    });

  } catch (error) {
    console.error("❌ Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message
    });
  }
};

// 🗑️ DELETE REVIEW (only by review owner)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    // Allow deletion if user is owner OR admin
    if (review.userId.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews."
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(id);

    console.log("🗑️ Review deleted:", id);

    res.json({
      success: true,
      message: "Review deleted successfully."
    });

  } catch (error) {
    console.error("❌ Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review.",
      error: error.message
    });
  }
};

// 👑 ADMIN: GET ALL REVIEWS
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, rating } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (productId) query.productId = productId;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('productId', 'name image')
      .populate('orderId', 'orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total
        }
      }
    });

  } catch (error) {
    console.error("❌ Get all reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message
    });
  }
};

// 📋 GET REVIEWS BY ORDER
export const getReviewsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    // Verify order belongs to user
    const Order = mongoose.model('Order');
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    // Get reviews for this order
    const reviews = await Review.find({ orderId })
      .populate('userId', 'name email')
      .populate('productId', 'name')
      .select('productId userId rating comment createdAt');

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error("❌ Get reviews by order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message
    });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const reviews = await Review.find({ userId })
      .populate("productId", "name image category")
      .populate("orderId", "orderStatus createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews.",
      error: error.message,
    });
  }
};
