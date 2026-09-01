import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
    },
    description :{
        type : String,
        required : true,
    },
    type: {
    type: String,
    enum: ["PG", "HOSTEL", "APARTMENT"],
    required: true
},

caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},
    owner :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    address: {
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    }
},
contact :{
    phone :{
        type : String,
        required : true,
    },
    email :
    {
        type : String,
        required : true,
    }
},
amenities: {
    type: [String],
    default: []
},
images: {
    type: [String],
    default: []
}
},{timestamps : true});

const Property = mongoose.model("Property",propertySchema);
export default Property;