import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    property : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Property",
        required : true
    },
    room :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Room",
        default : null
    }
},{ timestamps: true })

const Tenant = mongoose.model("Tenant",tenantSchema);
export default Tenant;