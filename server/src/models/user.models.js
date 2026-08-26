import mongoose,{Schema} from "mongoose";
import { AvailableUserRoles } from "../utils/constants.js";
import crypto from "crypto"
const userSchema = new Schema({
    fullName : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    phone : {
        type : String,
        required : true,
    },
   role: {
    type: String,
    enum: AvailableUserRoles,
    required: true
    },
    isEmailVerified: {
    type: Boolean,
    default: false
},

emailVerificationToken: {
    type: String
},

emailVerificationExpiry: {
    type: Date
},

refreshToken: {
    type: String
},

forgotPasswordToken: {
    type: String
},

forgotPasswordExpiry: {
    type: Date
},
},{timestamps : true});


userSchema.methods.generateTemporaryToken = function(){
    const unhashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
                        .createHash("sha256")
                        .update(unhashedToken)
                        .digest("hex");
    
    const tokenExpiry = Date.now() + 20*60*1000;

    return {
        unhashedToken,
        hashedToken,
        tokenExpiry
    };
}
const User = mongoose.model("User", userSchema);

export default User;
