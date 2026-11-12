const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Construction")
.then(()=>{console.log("Mongo connected for flats")})
.catch((err)=>console.log("error of mongo flats : ",err))

const projectSchema=new mongoose.Schema({
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