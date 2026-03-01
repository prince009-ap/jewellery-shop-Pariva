import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // User and Product references
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(value) {
        return value >= 1 && value <= 5;
      },
      message: 'Rating must be between 1 and 5'
    }
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(value) {
        return value && value.trim().length > 0;
      },
      message: 'Review comment cannot be empty'
    }
  },
  
  // Metadata
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

// Middleware to update product ratings after review is saved
reviewSchema.post('save', async function() {
  try {
    const Product = mongoose.model('Product');
    const productId = this.productId;
    
    // Calculate new average rating
    const stats = await mongoose.model('Review').aggregate([
      { $match: { productId: productId } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
});

// Middleware to update product ratings after review is removed
reviewSchema.post('remove', async function() {
  try {
    const Product = mongoose.model('Product');
    const productId = this.productId;
    
    // Recalculate after deletion
    const stats = await mongoose.model('Review').aggregate([
      { $match: { productId: productId } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      // No reviews left, reset to 0
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating after deletion:', error);
  }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
