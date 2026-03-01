import Wishlist from "../models/Wishlist.js";

export const createWishlist = async (req, res) => {
  const { title } = req.body;

  const exists = await Wishlist.findOne({
    user: req.user._id,
    title: new RegExp(`^${title}$`, "i"),
  });

  if (exists) {
    return res.status(400).json({ message: "Wishlist already exists" });
  }

  const wishlist = await Wishlist.create({
    user: req.user._id,
    title,
    products: [],
  });

  res.status(201).json(wishlist);
};

export const addToWishlist = async (req, res) => {
  const { wishlistId, productId } = req.body;

  const wishlist = await Wishlist.findById(wishlistId);

  if (!wishlist) {
    return res.status(404).json({ message: "Wishlist not found" });
  }

  if (!wishlist.products || !Array.isArray(wishlist.products)) {
    wishlist.products = [];
  }

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json(wishlist);
};

export const removeFromWishlist = async (req, res) => {
  const { wishlistId, productId } = req.body;

  const wishlist = await Wishlist.findById(wishlistId);
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();
  res.json(wishlist);
};

export const deleteWishlist = async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};


export const getWishlists = async (req, res) => {
  const wishlists = await Wishlist.find({ user: req.user._id })
    .populate("products"); // 🔧 VERY IMPORTANT - populate product details
  res.json(wishlists);
};



export const toggleProduct = async (req, res) => {
  const { wishlistId, productId } = req.body;

  const wishlist = await Wishlist.findById(wishlistId);

  if (!wishlist) {
    return res.status(404).json({ message: "Wishlist not found" });
  }

  const exists = wishlist.products.includes(productId);

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();

  res.json({
    success: true,
    action: exists ? "removed" : "added",
  });
};

export const getWishlistById = async (req, res) => {
  const wishlist = await Wishlist.findById(req.params.id)
    .populate("products");

  res.json(wishlist);
};

