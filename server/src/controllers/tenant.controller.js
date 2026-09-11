import Room from "../models/room.models.js";
import User from "../models/user.models.js";
import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTenant = AsyncHandler(async(req,res)=>{
       const {propertyId} = req.params;
       const {userId} = req.body;
       const property = await Property.findById(propertyId);
        if(!property)
        {
            throw new ApiError(404,"Property not found");
        }
       const user = await User.findById(userId);
       if(!user)
        {
            throw new ApiError(404,"User not found");
        }
       if(user.role !== "TENANT")
       {
            throw new ApiError(400,"User is not a tenant");
       }
       const existingTenant = await Tenant.findOne({
    user: userId,
    property: propertyId
});

if (existingTenant) {
    throw new ApiError(409, "Tenant already exists in this property");
}
        const tenant = new Tenant({
            user : userId,
            property : propertyId
        })
        await tenant.save();
        return res.status(201).json(
            new ApiResponse(201,{},"Tenant created successfully")
        )
});

const getTenants = AsyncHandler(async(req,res)=>{
      const {propertyId}  = req.params;
      const property = await Property.findById(propertyId);
        if(!property)
        {
            throw new ApiError(404,"Property not found");
        }
        const tenants  = await Tenant.find({
            property : propertyId
        });
        if(tenants.length === 0)
        {
            throw new ApiError(404,"tenants not found");
        }
        return res.status(200).json(
        new ApiResponse(200,tenants,"Tenants fetched successfully")
    )
});

const getTenantById = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const tenant = await Tenant.findOne({
        _id : tenantId,
        property : propertyId
    });
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    return res.status(200).json(
        new ApiResponse(200,tenant,"tenant fetched by id successfully")
    )
    
});

const updateTenant = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const {fullName,email,phone} = req.body;
     const tenant = await Tenant.findOne({
        _id : tenantId,
        property : propertyId
    });
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
     const user = await User.findById(tenant.user);

    if(!user)
    {
        throw new ApiError(404,"User not found");
    }
    if (fullName !== undefined) user.fullName = fullName;
if (email !== undefined) user.email = email;
if (phone !== undefined) user.phone = phone;
    await user.save();
     return res.status(200).json(
        new ApiResponse(200,user,"Tenant updated successfully")
    );
});

const deleteTenant = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const tenant = await Tenant.findOne({
        _id : tenantId,
        property : propertyId
    });
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
   
     if(tenant.room)
    {
        const room = await Room.findById(tenant.room);

        if(room)
        {
            room.occupants = room.occupants.filter(
                occupantId => !occupantId.equals(tenant._id)
            );

            await room.save();
        }
    }
    await Tenant.findByIdAndDelete(tenantId);
     return res.status(200).json(
        new ApiResponse(200,tenant,"Tenant deleted successfully")
    );
});

const assignTenantToRoom = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const {roomId} = req.body;
     const tenant = await Tenant.findOne({
        _id : tenantId,
        property : propertyId
    });
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    const room = await Room.findById(roomId);
    if(!room)
    {
        throw new ApiError(404,"Room not found");
    }
     if(tenant.room)
    {
        throw new ApiError(
            400,
            "Tenant is already assigned to a room"
        );
    }
    if(room.occupants.length >= room.capacity)
    {
        throw new ApiError(
            400,
            "Room is already full"
        );
    }

    tenant.room = roomId;
    room.occupants.push(tenantId);

    await tenant.save();
    await room.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tenant assigned to room successfully"
        )
    );

    
});
const removeTenantFromRoom = AsyncHandler(async(req,res)=>{
     const {propertyId,tenantId} = req.params;
     const tenant = await Tenant.findOne({
        _id : tenantId,
        property : propertyId
    });
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    if(!tenant.room)
    {
        throw new ApiError(400,"Tenant is not assigned to any room");
    }
    const room = await Room.findById(tenant.room);
    if(!room)
    {
        throw new ApiError(404,"Room not found");
    }
    room.occupants  = room.occupants.filter(
        occupantId => !occupantId.equals(tenantId)
    )
        tenant.room = null;

    await room.save();
    await tenant.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tenant removed from room successfully"
        )
    );
});

export {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    assignTenantToRoom,
    removeTenantFromRoom
}