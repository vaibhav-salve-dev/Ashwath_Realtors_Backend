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
    Price:{
        type:String,
        require:true
    },
    Location:{
        type:String,
        require:true
    },
    Bedrooms:{
        type:String,
        require:true
    },
    Bathrooms:{
        type:String,
        require:true
    },
     Area:{
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