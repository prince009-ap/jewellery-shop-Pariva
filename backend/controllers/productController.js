import Product from "../models/Product.js";
import Review from "../models/Review.js";

const attachReviewStatsToProducts = async (products) => {
  const productList = Array.isArray(products) ? products : [products].filter(Boolean);

  if (productList.length === 0) {
    return Array.isArray(products) ? [] : null;
  }

  const productIds = productList.map((product) => product._id);
  const reviewStats = await Review.aggregate([
    { $match: { productId: { $in: productIds } } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map(
    reviewStats.map((item) => [
      item._id.toString(),
      {
        averageRating: Math.round((item.averageRating || 0) * 10) / 10,
        totalReviews: item.totalReviews || 0,
      },
    ])
  );

  const enriched = productList.map((productDoc) => {
    const product = typeof productDoc.toObject === "function" ? productDoc.toObject() : { ...productDoc };
    const stats = statsMap.get(product._id.toString()) || {
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
    };

    return {
      ...product,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    };
  });

  return Array.isArray(products) ? enriched : enriched[0];
};

export const createProduct = async (req, res) => {
  try {

       console.log("BODY:", req.body);
    console.log("FILE:", req.file); // 👈 ADD THIS

    if (!req.file) {
      return res.status(400).json({ message: "Image file required" });
    }
    const creatorId = req.admin?._id || null;

const product = await Product.create({
  name: req.body.name,
  price: req.body.price,
  category: req.body.category,
  image: req.file?.filename,
  metal: req.body.metal,
  occasion: req.body.occasion,
  stock: req.body.stock,
  sku: req.body.sku,
  weight: req.body.weight,
  purity: req.body.purity,
  isFeatured: req.body.isFeatured === "true",
  isTrending: req.body.isTrending === "true",
  isRecommended: req.body.isRecommended === "true",
  createdBy: creatorId,
  // 🔥 REMOVED: Let Mongoose handle timestamps automatically
});
console.log("PRODUCT ADDED:", product);
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getProducts = async (req, res) => {
  const products = await Product.find()
    .select("name category price image metal occasion stock sku weight purity isFeatured isTrending isRecommended createdBy createdAt updatedAt averageRating totalReviews")
    .sort({ createdAt: -1 });
  res.json(await attachReviewStatsToProducts(products));
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.metal = req.body.metal || product.metal;        // ✅ ADD
product.occasion = req.body.occasion || product.occasion; // ✅ ADD

    if (req.file) {
      product.image = req.file.filename;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Use case-insensitive regex to match category
    const categoryRegex = new RegExp(['^' + category + '$'], 'i');
    const products = await Product.find({ category: categoryRegex }).sort({ createdAt: -1 });
    res.json(await attachReviewStatsToProducts(products));
  } catch (err) {
    console.error('Category query error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(await attachReviewStatsToProducts(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsByFilter = async (req, res) => {
  try {
    const {
      category,
      metal,
      purity,
      occasion,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      availability,
      featured,
      trending,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (metal) filter.metal = metal;
    if (purity) filter.purity = purity;
    if (occasion) filter.occasion = occasion;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (minWeight || maxWeight) {
      filter.weight = {};
      if (minWeight) filter.weight.$gte = parseFloat(minWeight);
      if (maxWeight) filter.weight.$lte = parseFloat(maxWeight);
    }
    
    if (availability === "in_stock") {
      filter.stock = { $gt: 0 };
    } else if (availability === "out_of_stock") {
      filter.stock = 0;
    }
    
    if (featured === "true") filter.isFeatured = true;
    if (trending === "true") filter.isTrending = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(filter).sort(sort);
    res.json(await attachReviewStatsToProducts(products));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
