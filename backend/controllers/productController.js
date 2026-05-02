import Product from "../models/Product.js";
import Review from "../models/Review.js";

const normalizeString = (value) => String(value || "").trim();
const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};
const normalizeBoolean = (value) => value === true || value === "true";

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
    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const name = normalizeString(req.body.name);
    const category = normalizeString(req.body.category);
    const metal = normalizeString(req.body.metal);
    const purity = normalizeString(req.body.purity);
    const occasion = normalizeString(req.body.occasion);
    const sku = normalizeString(req.body.sku).toUpperCase();
    const description = normalizeString(req.body.description);
    const shortDescription = normalizeString(req.body.shortDescription);
    const price = normalizeNumber(req.body.price);
    const stock = normalizeNumber(req.body.stock);
    const weight = normalizeNumber(req.body.weight);
    const makingChargePercent =
      req.body.makingChargePercent === undefined ? 12 : normalizeNumber(req.body.makingChargePercent);
    const stonePrice =
      req.body.stonePrice === undefined ? 0 : normalizeNumber(req.body.stonePrice);

    if (!name || !category || !metal || !purity || !occasion || !sku) {
      return res.status(400).json({ message: "Please fill all required product fields." });
    }

    if ([price, stock, weight, makingChargePercent, stonePrice].some(Number.isNaN)) {
      return res.status(400).json({
        message: "Price, stock, weight, making charges, and stone price must be valid numbers.",
      });
    }

    if (price < 0 || stock < 0 || weight <= 0) {
      return res.status(400).json({
        message: "Price and stock cannot be negative, and weight must be greater than zero.",
      });
    }

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(409).json({ message: `SKU '${sku}' already exists. Please use a unique SKU.` });
    }

    const creatorId = req.admin?._id || null;

    const product = await Product.create({
      name,
      category,
      metal,
      purity,
      occasion,
      price,
      weight,
      description,
      image: req.file.filename,
      makingChargePercent,
      stonePrice,
      stock,
      availability: stock > 0 ? "in_stock" : "out_of_stock",
      sku,
      shortDescription,
      isFeatured: normalizeBoolean(req.body.isFeatured),
      isTrending: normalizeBoolean(req.body.isTrending),
      isRecommended: normalizeBoolean(req.body.isRecommended),
      isNewArrival: normalizeBoolean(req.body.isNewArrival),
      createdBy: creatorId,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    if (err.code === 11000 && err.keyPattern?.sku) {
      return res.status(409).json({ message: "This SKU already exists. Please choose another one." });
    }
    res.status(500).json({ message: err.message || "Product could not be created." });
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
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const nextSku = req.body.sku !== undefined ? normalizeString(req.body.sku).toUpperCase() : product.sku;
    if (nextSku !== product.sku) {
      const existingSku = await Product.findOne({ sku: nextSku, _id: { $ne: product._id } });
      if (existingSku) {
        return res.status(409).json({ message: `SKU '${nextSku}' already exists. Please use a unique SKU.` });
      }
      product.sku = nextSku;
    }

    if (req.body.name !== undefined) product.name = normalizeString(req.body.name);
    if (req.body.price !== undefined) product.price = normalizeNumber(req.body.price);
    if (req.body.category !== undefined) product.category = normalizeString(req.body.category);
    if (req.body.metal !== undefined) product.metal = normalizeString(req.body.metal);
    if (req.body.occasion !== undefined) product.occasion = normalizeString(req.body.occasion);
    if (req.body.purity !== undefined) product.purity = normalizeString(req.body.purity);
    if (req.body.stock !== undefined) product.stock = normalizeNumber(req.body.stock);
    if (req.body.weight !== undefined) product.weight = normalizeNumber(req.body.weight);
    if (req.body.description !== undefined) product.description = normalizeString(req.body.description);
    if (req.body.shortDescription !== undefined) product.shortDescription = normalizeString(req.body.shortDescription);
    if (req.body.makingChargePercent !== undefined) {
      product.makingChargePercent = normalizeNumber(req.body.makingChargePercent);
    }
    if (req.body.stonePrice !== undefined) {
      product.stonePrice = normalizeNumber(req.body.stonePrice);
    }
    if (req.body.isFeatured !== undefined) product.isFeatured = normalizeBoolean(req.body.isFeatured);
    if (req.body.isTrending !== undefined) product.isTrending = normalizeBoolean(req.body.isTrending);
    if (req.body.isRecommended !== undefined) product.isRecommended = normalizeBoolean(req.body.isRecommended);
    if (req.body.isNewArrival !== undefined) product.isNewArrival = normalizeBoolean(req.body.isNewArrival);

    if ([product.price, product.stock, product.weight, product.makingChargePercent, product.stonePrice].some(Number.isNaN)) {
      return res.status(400).json({
        message: "Price, stock, weight, making charges, and stone price must be valid numbers.",
      });
    }

    if (product.price < 0 || product.stock < 0 || product.weight <= 0) {
      return res.status(400).json({
        message: "Price and stock cannot be negative, and weight must be greater than zero.",
      });
    }

    product.availability = product.stock > 0 ? "in_stock" : "out_of_stock";

    if (req.file) {
      product.image = req.file.filename;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    if (err.code === 11000 && err.keyPattern?.sku) {
      return res.status(409).json({ message: "This SKU already exists. Please choose another one." });
    }
    res.status(500).json({ message: err.message || "Update failed" });
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
    const categoryRegex = new RegExp(["^" + category + "$"], "i");
    const products = await Product.find({ category: categoryRegex }).sort({ createdAt: -1 });
    res.json(await attachReviewStatsToProducts(products));
  } catch (err) {
    console.error("Category query error:", err);
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
      sortOrder = "desc",
    } = req.query;

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

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(filter).sort(sort);
    res.json(await attachReviewStatsToProducts(products));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
