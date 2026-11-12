const express = require('express');
const handler = require("../controllers/enquiryHandler");

const router = express.Router();

router.post("/getData", handler.getData);
router.get("/sendData", handler.sendData);
router.post("/updateStatus", handler.updateStatus);
router.delete("/:id", handler.deleteEnquiry);
router.post("/deleteData", handler.deleteEnquiry);

module.exports = router;
