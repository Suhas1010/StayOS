import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const verifyJWT = AsyncHandler(async(req,res,next)=>{
    const accessToken = req.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        throw new ApiError(401, "Access token is required");
    }
      const decodedToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if(!user)
    {
        throw new ApiError(404,"User does not exist");
    }
    req.user = user;
     next();
    
});

export {verifyJWT};