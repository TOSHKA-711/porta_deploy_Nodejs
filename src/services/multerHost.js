import multer from "multer";

export const multerHost = () => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    cb(null, true);
  };

  const fileUpload = multer({
    fileFilter,
    storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 50MB لكل ملف
      files: 1000, // عدد الملفات كحد أقصى
    },
  });

  return fileUpload;
};
