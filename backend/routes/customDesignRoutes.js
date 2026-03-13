import express from "express";
import CustomDesign from "../models/CustomDesign.js";
import upload from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { sendMail } from "../utils/sendMail.js";

const router = express.Router();

// ADMIN: GET ALL REQUESTS
router.get("/admin/custom-design", protectAdmin, async (req, res) => {
  try {
    const list = await CustomDesign.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email mobile");
    res.json(list);
  } catch (err) {
    console.error("CUSTOM LIST ERROR:", err);
    res.status(500).json({ message: "Failed to load custom requests" });
  }
});

// ADMIN: APPROVE
router.put("/admin/custom-design/:id/approve", protectAdmin, async (req, res) => {
  try {
    const { finalWeight, makingCharge, goldRate, metalRate, stoneCharge, gstPercent, deliveryDays, adminNote } = req.body;
    const effectiveRate = metalRate ?? goldRate;

    if (!finalWeight || !makingCharge || !effectiveRate) {
      return res.status(400).json({ message: "Missing price inputs" });
    }

    const parsedWeight = Number(finalWeight);
    const parsedMetalRate = Number(effectiveRate);
    const parsedMaking = Number(makingCharge);
    const parsedStone = Number(stoneCharge || 0);
    const parsedGstPercent = Number(gstPercent || 0);
    const baseAmount = parsedWeight * parsedMetalRate + parsedMaking + parsedStone;
    const gstAmount = (baseAmount * parsedGstPercent) / 100;
    const price = Math.round((baseAmount + gstAmount) * 100) / 100;

    const design = await CustomDesign.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        finalWeight: parsedWeight,
        goldRate: parsedMetalRate,
        makingCharge: parsedMaking,
        stoneCharge: parsedStone,
        gstAmount,
        finalPrice: price,
        deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
        adminNote: adminNote || "",
        rejectReason: undefined,
        rejectionSuggestion: undefined
      },
      { new: true }
    ).populate("userId", "name email mobile");

    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    if (!design.userId || !design.userId.email) {
      return res.status(500).json({ message: "User data missing for this design" });
    }

    await sendMail({
      to: design.userId.email,
      subject: "Your Custom Jewellery Request Approved",
      html: `
        <h2>Approved</h2>
        <p>Your custom jewellery request has been approved.</p>
        <p><b>Name:</b> ${design.userId.name || "Customer"}</p>
        <p><b>Email:</b> ${design.userId.email || "-"}</p>
        <p><b>Mobile:</b> ${design.userId.mobile || "-"}</p>
        <p><b>Jewellery:</b> ${design.jewelleryType || "-"}</p>
        <p><b>Metal:</b> ${design.metalType || "-"}</p>
        <hr />
        <p><b>Final Weight:</b> ${parsedWeight} gm</p>
        <p><b>${design.metalType || "Metal"} Rate:</b> Rs ${parsedMetalRate}</p>
        <p><b>Making Charge:</b> Rs ${parsedMaking}</p>
        <p><b>Stone Charge:</b> Rs ${parsedStone}</p>
        <p><b>GST:</b> Rs ${gstAmount.toFixed(2)}</p>
        <p><b>Total Price:</b> Rs ${price}</p>
        ${deliveryDays ? `<p><b>Estimated Delivery:</b> ${deliveryDays} days</p>` : ""}
        ${adminNote ? `<p><b>Admin Note:</b> ${adminNote}</p>` : ""}
      `,
    });

    res.json(design);
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Approve failed" });
  }
});

// ADMIN: REJECT
router.put("/admin/custom-design/:id/reject", protectAdmin, async (req, res) => {
  try {
    const { reason, alternativeJewelleryType, alternativeMetalType, alternativeApproxPrice, alternativeNote } = req.body;

    const suggestion =
      alternativeJewelleryType || alternativeMetalType || alternativeApproxPrice || alternativeNote
        ? {
            jewelleryType: alternativeJewelleryType || "",
            metalType: alternativeMetalType || "",
            approxPrice: alternativeApproxPrice ? Number(alternativeApproxPrice) : undefined,
            note: alternativeNote || ""
          }
        : undefined;

    const design = await CustomDesign.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectReason: reason,
        rejectionSuggestion: suggestion
      },
      { new: true }
    ).populate("userId", "name email mobile");

    if (!design?.userId?.email) {
      return res.status(500).json({ message: "User email missing" });
    }

    await sendMail({
      to: design.userId.email,
      subject: "Custom Jewellery Request Rejected",
      html: `
        <h2>Request Rejected</h2>
        <p><b>Name:</b> ${design.userId.name || "Customer"}</p>
        <p><b>Email:</b> ${design.userId.email || "-"}</p>
        <p><b>Mobile:</b> ${design.userId.mobile || "-"}</p>
        <p><b>Jewellery:</b> ${design.jewelleryType || "-"}</p>
        <p><b>Metal:</b> ${design.metalType || "-"}</p>
        <p><b>Reason:</b> ${reason || "No reason provided"}</p>
        ${
          suggestion
            ? `
        <hr />
        <h3>Suggested Alternative</h3>
        <p><b>Jewellery:</b> ${suggestion.jewelleryType || "-"}</p>
        <p><b>Metal:</b> ${suggestion.metalType || "-"}</p>
        <p><b>Approx Price:</b> ${suggestion.approxPrice ? `Rs ${suggestion.approxPrice}` : "-"}</p>
        <p><b>Note:</b> ${suggestion.note || "-"}</p>
        `
            : ""
        }
      `,
    });

    res.json(design);
  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Reject failed" });
  }
});

// USER: SUBMIT CUSTOM DESIGN
router.post("/custom-design", protect, upload.single("referenceImage"), async (req, res) => {
  try {
    let parsedBudgetTier;

    if (req.body.budgetTier) {
      try {
        parsedBudgetTier = JSON.parse(req.body.budgetTier);
      } catch (error) {
        parsedBudgetTier = undefined;
      }
    }

    const design = await CustomDesign.create({
      userId: req.user._id,
      jewelleryType: req.body.jewelleryType,
      purpose: req.body.purpose,
      budgetTier: parsedBudgetTier,
      description: req.body.description,
      metalType: req.body.metal,
      purity: req.body.purity,
      stone: req.body.stone,
      approxWeight: req.body.approxWeight,
      stones: req.body.stone ? req.body.stone.split(",") : [],
      size: req.body.ringSize || req.body.necklaceLength || req.body.bangleSize || req.body.size,
      ringSize: req.body.ringSize ? Number(req.body.ringSize) : undefined,
      necklaceLength: req.body.necklaceLength,
      bangleSize: req.body.bangleSize,
      finish: req.body.finish,
      occasion: req.body.occasion,
      budgetMin: parsedBudgetTier?.min ?? req.body.budgetMin,
      budgetMax: parsedBudgetTier?.max ?? req.body.budgetMax,
      referenceImage: req.file?.filename,
      status: "pending",
    });

    res.status(201).json(design);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Custom design failed" });
  }
});

// USER: GET OWN CUSTOM DESIGNS
router.get("/custom-design", protect, async (req, res) => {
  const designs = await CustomDesign.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(designs);
});

// USER: DELETE OWN CUSTOM DESIGN (only pending/rejected)
router.delete("/custom-design/:id", protect, async (req, res) => {
  const design = await CustomDesign.findOne({ _id: req.params.id, userId: req.user.id });

  if (!design) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (design.status === "approved") {
    return res.status(400).json({ message: "Approved designs cannot be deleted" });
  }

  await design.deleteOne();
  res.json({ message: "Custom design removed" });
});

export default router;
