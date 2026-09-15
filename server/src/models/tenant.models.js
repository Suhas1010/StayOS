import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index: true
    },
    property : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Property",
        required : true,
        index: true
    },
    room :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Room",
        default : null
    }
},{ timestamps: true })
tenantSchema.index({
    user: 1,
    property: 1
});
const Tenant = mongoose.model("Tenant",tenantSchema);
export default Tenant;