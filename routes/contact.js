const express = require('express');
const handler = require("../controllers/contactHandler");

const router = express.Router();

router.post("/getData", handler.getData);
router.get("/sendData", handler.sendData);
router.post("/reply", handler.reply);
router.post("/updateStatus", handler.update);
router.delete("/:id", handler.deleteContact);
router.post("/deleteData", handler.deleteContact);

module.exports = router;
