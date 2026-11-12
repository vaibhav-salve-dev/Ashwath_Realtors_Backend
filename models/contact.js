const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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



