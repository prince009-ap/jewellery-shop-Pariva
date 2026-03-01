import Address from "../models/Address.js";

export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(addresses);
};

export const addAddress = async (req, res) => {
  try {
    const {
      label,
      name,
      phone,
      house,
      floor,
      area,
      landmark,
      city,
      state,
      pincode,
      lat,
      lng,
    } = req.body;

    // ✅ Proper validation
    if (!name || !phone || !house || !area || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const address = await Address.create({
      label,
      name,
      phone,
      house,
      floor,
      area,
      landmark,
      city,
      state,
      pincode,
      lat,
      lng,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      address,
    });

  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
};
/* ✏️ UPDATE address */
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR ❌", err);
    res.status(500).json({ message: "Update failed" });
  }
};


/* 🗑 DELETE address */
export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  const address = await Address.findOneAndDelete({
    _id: id,
    user: req.user.id,
  });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  res.json({ message: "Address deleted" });
};

export const setDefault = async (req, res) => {
  await Address.updateMany(
    { user: req.user.id },
    { isDefault: false }
  );
  await Address.findByIdAndUpdate(req.params.id, { isDefault: true });
  res.json({ success: true });
};
