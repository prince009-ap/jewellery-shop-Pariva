import express from "express";
import protect  from "../middleware/authMiddleware.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefault
} from "../controllers/addressController.js";

const router = express.Router();

router.get("/", protect, getAddresses);
router.post("/", protect, addAddress);

router.put("/:id", protect, updateAddress);


router.delete("/:id", protect, deleteAddress);
router.put("/default/:id", protect, setDefault);
router.get("/", protect, async (req, res) => {
  const addresses = await Address.find({ user: req.user.id });
  res.json(addresses);
});

router.post("/", protect, async (req, res) => {
  const address = await Address.create({
    ...req.body,
    user: req.user.id
  });
  res.json(address);
});
export default router;
