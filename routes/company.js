const express=require('express');
const handler=require("../controllers/companyHandler");

const router=express.Router();

router.post("/getData",handler.getData);

router.get("/sendData",handler.sendData);

router.post("/updateData",handler.updateData);
module.exports=router;
