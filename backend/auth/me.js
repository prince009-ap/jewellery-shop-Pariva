    router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});
