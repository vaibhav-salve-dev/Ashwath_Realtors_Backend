const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Construction")
.then(()=>{console.log("Mongo connected for enquiry")})
.catch((err)=>console.log("error of mongo enquiry : ",err))

const enquirySchema=new mongoose.Schema({
    Name:{
        type:String,
        required:true,
    },
    Email:{
        type:String,
        required:true
    },
    Phone:{
        type:String
    },
    Property:{
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true
    },
    Message:{
        type:String,
        required:true
    },
    Date:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        required:true
    }
});

const enquiryModel=mongoose.model("enquirys",enquirySchema);

module.exports=enquiryModel;



