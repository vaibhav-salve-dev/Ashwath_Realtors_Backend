const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    founded:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        require:true
    },
    mission:{
        type:String,
        require:true
    },
    vision:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    totalProjects:{
        type:String,
        require:true
    },
    yearsExperience:{
        type:String,
        require:true
    },
    teamMembers:{
        type:String,
        require:true
    },
    clientSatisfaction:{
        type:Number,
        require:true
    },
    website:{
        type:String,
        require:true
    },
    tagline:{
        type:String,
        default:'SPACES. STORIES. LEGACY.'
    }


});

const companyModel=mongoose.model("Company",companySchema);

module.exports=companyModel;