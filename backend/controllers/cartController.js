import Cart from "../models/Cart.js";  // ✅ YE LINE MISSING THI

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product"
  );

  if (!cart) return res.json({ items: [] });

  res.json(cart);
};

export const addToCart = async (req, res) => {
  
  console.log("ADD TO CART HIT", req.user?.id, req.body);

  const { productId, qty = 1 } = req.body || {};

  if (!productId) {
    return res.status(400).json({
      message: "productId is required",
    });
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: productId, qty }],
    });
    return res.json(cart);
  }

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (item) {
    item.qty += qty;
  } else {
    cart.items.push({ product: productId, qty });
  }

  await cart.save();
  res.json(cart);
};


export const updateCartQty = async (req, res) => {
  const { productId, qty } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );

  if (item) item.qty = qty;

  await cart.save();
  res.json(cart);
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== productId
  );

  await cart.save();
  res.json(cart);
};
