import Property from "../models/property.models.js";
import User from "../models/user.models.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProperty = AsyncHandler(async(req,res)=>{
    const {name,description,type,address,contact,amenities,images} = req.body;
    const ownerId = req.user._id;
    if(!name || !description || !type ||!address ||!contact)
    {
        throw new ApiError(400,"All required details are needed")
    }
    const property = new Property({
        name,
        description,
        type,
        owner : ownerId,
        address,
        contact,
        amenities,
        images
    })
    await property.save();
    return res.status(201).json(
        new ApiResponse(201,{},"Property created successfully")
    );
});
const getProperties = AsyncHandler(async(req,res)=>{
    const properties = await Property.find({
        owner : req.user._id
    });
    if(properties.length === 0)
    {
        throw new ApiError(404,"Properties not found");
    }
    return res.status(200).json(
        new ApiResponse(200,properties,"Properties fetched successfully")
    )

});
const getPropertyById = AsyncHandler(async(req,res)=>{
    const {propertyId} = req.params;
    const property = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404,"Property does not exist ")
    }
    return res.status(200).json(
        new ApiResponse(200,property,"Property fetched by id successfully")
    )
});
const updateProperty = AsyncHandler(async(req,res)=>{
    const {propertyId} = req.params;
    const {name,description,type,address,contact,amenities,images} = req.body;
    const property = await Property.findByIdAndUpdate(
        propertyId,
        {
            name,
            description,
            type,
            address,
            contact,
            amenities,
            images
        },
        {
        new: true,
        runValidators: true
        }
    )
    if (!property) {
    throw new ApiError(404, "Property not found");
}
 return res.status(200).json(
    new ApiResponse(200,property,"Updated property successfully")
 )    
});
const assignCaretaker = AsyncHandler(async(req,res)=>{
    const {propertyId} = req.params;
    const {caretakerId} = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
    throw new ApiError(404, "Property not found");
    }
    const user = await User.findById(caretakerId);
     if (!user) {
    throw new ApiError(404, "User not found");
     }
    if(user.role !== "CARETAKER")
    {
        throw new ApiError(403,"This person cannot be assigned as caretaker");
    }
    property.caretaker = user._id;
    await Property.save();
    return res.status(200).json(
        new ApiResponse(200,{},"Caretaker assigned successfully")
    )
});
const deleteProperty  = AsyncHandler(async(req,res)=>{
    const {propertyId} = req.params;
    const property = await Property.findByIdAndDelete(propertyId);
    if(!property)
    {
         throw new ApiError(404, "Property not found");
    }
    return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Property deleted successfully"
    )
);
});
export {createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    assignCaretaker,
    deleteProperty
}