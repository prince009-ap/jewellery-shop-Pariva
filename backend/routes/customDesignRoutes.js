import express from "express";
import CustomDesign from "../models/CustomDesign.js";
import upload from "../middleware/upload.js";
import  protect  from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";


import { sendMail } from "../utils/sendMail.js";
import User from "../models/User.js";

const router = express.Router();

/* 📥 ADMIN – GET ALL REQUESTS */
router.get(
  "/admin/custom-design",

  
  protectAdmin,
  async (req, res) => {
    const list = await CustomDesign.find().populate("userId", "name email");
    res.json(list);
  }
);

/* ✅ APPROVE */
router.put(
  "/admin/custom-design/:id/approve",
 
  protectAdmin,
  async (req, res) => {
    try {
      const { finalWeight, makingCharge, goldRate } = req.body;

      if (!finalWeight || !makingCharge || !goldRate) {
        return res.status(400).json({ message: "Missing price inputs" });
      }

      const price =
        Number(finalWeight) * Number(goldRate) +
        Number(makingCharge);

      const design = await CustomDesign.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
          finalWeight: Number(finalWeight),
          makingCharge: Number(makingCharge),
          finalPrice: price,
        },
        { new: true }
      ).populate("userId");

      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }

      // 🔥 IMPORTANT SAFETY CHECK
      if (!design.userId || !design.userId.email) {
        console.error("USER DATA MISSING:", design);
        return res.status(500).json({
          message: "User data missing for this design",
        });
      }

      // ✅ SEND MAIL
      await sendMail({
        to: design.userId.email,
        subject: "Your Custom Jewellery Request Approved 💍",
        html: `
          <h2>Approved 🎉</h2>
          <p>Your custom jewellery request has been approved.</p>
          <p><b>Final Weight:</b> ${finalWeight} gm</p>
          <p><b>Making Charge:</b> ₹${makingCharge}</p>
          <p><b>Total Price:</b> ₹${price}</p>
        `,
      });

      res.json(design);
    } catch (err) {
      console.error("APPROVE ERROR FULL:", err);
      res.status(500).json({ message: "Approve failed" });
    }
  }
);

/* ❌ REJECT */
router.put(
  "/admin/custom-design/:id/reject",

  protectAdmin,
  async (req, res) => {
    try {
      const { reason } = req.body;

      const design = await CustomDesign.findByIdAndUpdate(
        req.params.id,
        {
          status: "rejected",
          rejectReason: reason,
        },
        { new: true }
      ).populate("userId");

      if (!design?.userId?.email) {
        return res.status(500).json({ message: "User email missing" });
      }

      await sendMail({
        to: design.userId.email,
        subject: "Custom Jewellery Request Rejected",
        html: `
          <h2>Request Rejected</h2>
          <p><b>Reason:</b> ${reason}</p>
        `,
      });

      res.json(design);
    } catch (err) {
      console.error("REJECT ERROR:", err);
      res.status(500).json({ message: "Reject failed" });
    }
  }
);


/* 🧑 USER → SUBMIT CUSTOM DESIGN */
router.post(
  "/custom-design",
  protect,
  upload.single("referenceImage"),
  async (req, res) => {
    try {
      console.log("FINAL USER:", req.user);
      const design = await CustomDesign.create({
        userId: req.user._id,
        jewelleryType: req.body.jewelleryType,
        description: req.body.description,
        metalType: req.body.metal,
        purity: req.body.purity,
        approxWeight: req.body.approxWeight,
        stones: req.body.stone ? req.body.stone.split(",") : [],
        size: req.body.size,
        budgetMin: req.body.budgetMin,
        budgetMax: req.body.budgetMax,
        referenceImage: req.file?.filename,
        status: "pending"
      });

      res.status(201).json(design);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Custom design failed" });
    }
  }
);

// ✅ USER → GET OWN CUSTOM DESIGNS
router.get(
  "/custom-design",
  protect,
  async (req, res) => {
    const designs = await CustomDesign.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(designs);
  }
);

// 🗑️ USER → DELETE OWN CUSTOM DESIGN (only pending / rejected)
router.delete(
  "/custom-design/:id",
  protect,
  async (req, res) => {
    const design = await CustomDesign.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!design) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (design.status === "approved") {
      return res
        .status(400)
        .json({ message: "Approved designs cannot be deleted" });
    }

    await design.deleteOne();
    res.json({ message: "Custom design removed" });
  }
);


export default router;



