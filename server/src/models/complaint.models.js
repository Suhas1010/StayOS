import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    tenant :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Tenant",
        required : true
    },
    property :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Property",
        required : true
    },
    title :{
        type : String,
        required : true
    },
    description :{
         type : String,
        required : true
    },
   status: {
    type: String,
    enum: ["REPORTED", "IN_PROGRESS", "RESOLVED"],
    default: "REPORTED"
}
},{
    timestamps: true
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;