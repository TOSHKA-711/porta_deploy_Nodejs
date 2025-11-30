export const allowedExtensions = {
  images: ["image/jpeg", "image/png"],
  files: ["application/json , text/plain, application/pdf ,"],
  videos: ["video/mp4"],
  code: [
    "text/javascript", // JS files (.js)
    "application/javascript",
    "text/typescript", // TS files (.ts)
    "application/typescript",
    "text/html", // HTML files
    "text/css", // CSS files
    "application/json", // JSON files
    "text/plain", // .env أو README أو نصوص عادية
    "application/xml", // أحياناً config files
    "application/octet-stream", // fallback لبعض الأنواع غير المعروفة
  ],
};
