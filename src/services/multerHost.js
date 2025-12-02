import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const multerHost = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    cb(null, true);
  };

  const fileUpload = multer({
    fileFilter,
    storage,
    limits: {
      fileSize: 1000 * 1024 * 1024, // 1000MB لكل ملف
      files: 1000, // عدد الملفات كحد أقصى
    },
  });

  return fileUpload;
};
