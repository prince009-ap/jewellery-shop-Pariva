import multer from "multer";
import path from "path";
import fs from "fs";

const chatUploadDir = path.join(process.cwd(), "uploads", "chat");

if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, chatUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    cb(null, `${Date.now()}_${safeBase}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;
