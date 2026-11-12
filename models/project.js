const mongoose=require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Construction")
.then(()=>{console.log("Mongo connected for projects")})
.catch((err)=>console.log("error of mongo projects : ",err))

const projectSchema=new mongoose.Schema({
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