import mongoose from "mongoose"

const rentSchema = new mongoose.Schema({
    tenant : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Tenant",
        required : true
    },
    property :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Property",
        required : true
    },
    amount : {
        type : Number,
        required : true,
    },
    dueDate :{
          type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "OVERDUE"],
        default: "PENDING"
    }
},{timestamps : true});
const Rent = mongoose.model("Rent", rentSchema);

export default Rent;