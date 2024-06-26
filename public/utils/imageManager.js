const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage(); // Store files in memory as buffers

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const resizeAndConvertImage = async (buffer) => {
  return sharp(buffer)
    .resize(null, 300) // Resize image to 300px height while maintaining aspect ratio
    .toFormat("webp") // Convert image to WEBP
    .webp({ quality: 90 }) // Set WEBP quality to 90%
    .toBuffer(); // Return buffer
};

module.exports = { upload, resizeAndConvertImage };
