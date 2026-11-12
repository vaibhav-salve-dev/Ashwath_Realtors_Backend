const express = require('express');
const handler = require("../controllers/projectHandler");
const multer = require("multer");
const router = express.Router();

// Memory storage for fast buffering & direct Cloudinary streaming
const storage = multer.memoryStorage();

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
