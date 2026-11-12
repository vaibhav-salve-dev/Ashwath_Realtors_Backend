const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Construction")
.then(()=>{console.log("Mongo connected for contact")})
.catch((err)=>console.log("error of mongo contact : ",err))

const contactSchema=new mongoose.Schema({
    Name:{
        type:String,
        required:true,
    },
    Phone:{
        type:String
    },

    Email:{
        type:String,
        required:true
    },
    Subject:{
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
    },

});

const contactModel=mongoose.model("contacts",contactSchema);

module.exports=contactModel;



