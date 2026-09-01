import Property from "../models/property.models.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const verifyPropertyOwnership = AsyncHandler(async (req, res, next) => {
   const {propertyId}  = req.params;
   const property = await Property.findById(propertyId);
   if (!property) {
    throw new ApiError(404, "Property not found");
}
   if(property.owner.toString() !== req.user._id.toString())
   {
    throw new ApiError(403,"The property does not belong to the particular owner");
   }
   next();

});

const verifyCaretakerAssignment = AsyncHandler(async(req,res,next)=>{
   const {propertyId} = req.params;
   const property = await Property.findById(propertyId);
     if (!property) {
    throw new ApiError(404, "Property not found");
}
if (
    !property.caretaker ||
    property.caretaker.toString() !== req.user._id.toString()
)
   {
    throw new ApiError(403,"The property does not belong to the particular caretaker");
   }
   next();
});

const verifyPropertyAccess = AsyncHandler(async(req,res,next)=>{
    const {propertyId} = req.params;
   const property = await Property.findById(propertyId);
     if (!property) {
    throw new ApiError(404, "Property not found");
}
 const userId = req.user._id.toString();
 const isOwner =
        property.owner.toString() === userId;
 const isCaretaker =
    property.caretaker &&
    property.caretaker.toString() === userId;
if (!isOwner && !isCaretaker) {
        throw new ApiError(
            403,
            "You do not have access to this property"
        );
    }
 next();
})
export {verifyPropertyOwnership,
   verifyCaretakerAssignment,
   verifyPropertyAccess
}