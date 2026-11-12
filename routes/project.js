const express = require('express');
const handler = require("../controllers/projectHandler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post("/getData", upload.single("Image"), handler.getData);
router.get("/sendData", handler.sendData);
router.post("/updateData", upload.single("Image"), handler.updateData);
router.post("/deleteData", handler.deleteData);
router.delete("/:id", handler.deleteData);

module.exports = router;
