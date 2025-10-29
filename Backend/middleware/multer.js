const multer = require("multer");
const path = require("path");

// Save files temporarily before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WEBP images allowed"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
