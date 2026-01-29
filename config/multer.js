const multer = require("multer");

// Memory storage - stores files in memory temporarily
const storage = multer.memoryStorage();

// Filter for only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// Initialize Multer
const upload = multer({ storage, fileFilter });

module.exports = upload;