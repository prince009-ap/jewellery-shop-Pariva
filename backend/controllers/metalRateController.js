import MetalRate from "../models/MetalRate.js";
import Product from "../models/Product.js";

export const updateMetalRates = async (req, res) => {
  try {
    const { goldRate, silverRate } = req.body;

    // 1️⃣ Save rate history
    await MetalRate.create({ goldRate, silverRate });

    // 2️⃣ Update GOLD products
    const goldProducts = await Product.find({ metalType: "gold" });

    for (let p of goldProducts) {
      const making = (p.weight * goldRate * p.makingChargePercent) / 100;
      p.price = p.weight * goldRate + making + p.stonePrice;
      await p.save();
    }

    // 3️⃣ Update SILVER products
    const silverProducts = await Product.find({ metalType: "silver" });

    for (let p of silverProducts) {
      const making = (p.weight * silverRate * p.makingChargePercent) / 100;
      p.price = p.weight * silverRate + making + p.stonePrice;
      await p.save();
    }

    res.json({ message: "Metal rates updated & prices recalculated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rate update failed" });
  }
};
