import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomNumber :{
        type : String,
        required : true
    },
    capacity :{
        type : Number,
        required : true
    },
    rentAmount : {
         type : Number,
        required : true
    },
    property :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Property"
    },
    occupants : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "User",
        default : []
    }
});

const Room = mongoose.model("Room",roomSchema);
export default Room;