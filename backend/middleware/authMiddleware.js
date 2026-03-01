// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import adminAuthMiddleware from "./adminAuthMiddleware.js";

// export const protect = async (req, res, next) => {
//   try {
//     let token;

//     // ✅ 1️⃣ cookie se token
//     if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     // ✅ 2️⃣ fallback: Authorization header
//     if (
//       !token &&
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized, no token" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = user; // ⭐ VERY IMPORTANT
//     next();
//   } catch (error) {
//     console.error("AUTH MIDDLEWARE ERROR:", error);
//     return res.status(401).json({ message: "Not authorized" });
//   }
// };
// export default adminAuthMiddleware;


import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR 👉", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect; // ✅ DEFAULT EXPORT ONLY
