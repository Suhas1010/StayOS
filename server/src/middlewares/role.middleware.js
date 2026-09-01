import {ApiError} from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
const verifyRole = (allowedRoles) => {
return AsyncHandler(async(req,res,next)=>{
 const role = req.user.role;

 if(!allowedRoles.includes(role))
 {
    throw new ApiError(403,"This user is not allowed to caary out the particular task");
 }
 next();

})

};
export {verifyRole};