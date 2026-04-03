import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export default async function chatAuthMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token =
      header && header.startsWith("Bearer ")
        ? header.split(" ")[1]
        : req.cookies?.token;

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("name email role");

    if (admin) {
      req.admin = admin;
      return next();
    }

    const user = await User.findById(decoded.id).select("name email mobile role");
    if (!user) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
