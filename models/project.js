const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    Title:{
        type:String,
        require:true
    },
    
    Category:{
        type:String,
        require:true
    },
    Status:{
        type:String,
        require:true
    },
    Year:{
        type:Number,
        required:true
    },
    Duration:{
        type:String,
        require:true
    },
    Image:{
        type:String,
        require:true
    },
    Description:{
        type:String,
        require:true
    }
    
});

const projectModel=mongoose.model("project",projectSchema);

module.exports=projectModel;