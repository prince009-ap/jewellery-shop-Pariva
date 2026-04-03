function buildAttachment(req, file) {
  return {
    kind: file.mimetype.startsWith("image/") ? "image" : "file",
    url: `${req.protocol}://${req.get("host")}/uploads/chat/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

export async function uploadChatAttachment(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file selected" });
  }

  res.json({
    attachment: buildAttachment(req, req.file),
  });
}
