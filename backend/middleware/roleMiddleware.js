// middleware/roleMiddleware.js
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
};
export const isUser = (req, res, next) => {
  if (req.user.role !== "user") return res.sendStatus(403);
  next();
}