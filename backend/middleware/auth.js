import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // accept token from Authorization header (Bearer ...) or cookie
    const header = req.headers.authorization;
    const token = header && header.startsWith("Bearer")
      ? header.split(" ")[1]
      : req.cookies?.token;

    if (!token) return res.status(401).json({ message: "Not logged in" });

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error("Auth protect error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
};
