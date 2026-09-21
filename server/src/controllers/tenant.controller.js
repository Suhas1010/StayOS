import Room from "../models/room.models.js";
import User from "../models/user.models.js";
import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import Rent from "../models/rent.models.js";
import Complaint from "../models/complaint.models.js";
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
      const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError(400, "Invalid pagination parameters");
    }   
    const skip = (page - 1) * limit;
    const { search, room } = req.query;
      const property = await Property.findById(propertyId);
        if(!property)
        {
            throw new ApiError(404,"Property not found");
        }
        const filter = {
             property: propertyId
        };

    if (room) {
         filter.room = room;
    }
    if (search) {
    const users = await User.find({
        $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ]
    }).select("_id");

    filter.user = {
        $in: users.map(user => user._id)
    };
}
        const tenants = await Tenant.find(filter)
    .skip(skip)
    .limit(limit);
    const total = await Tenant.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
        if(total === 0)
    {
        throw new ApiError(404, "No tenants found");
    }
        return res.status(200).json(
        new ApiResponse(200,{tenants, pagination : {
                page,
                limit,
                total,
                totalPages
            }},"Tenants fetched successfully")
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
    if (email !== undefined && user.email !== email) {
        user.email = email;
        user.isEmailVerified = false;
    }
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
    await Rent.deleteMany({ tenant: tenantId });
    await Complaint.deleteMany({ tenant: tenantId });
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
    if(!room.property.equals(propertyId))
    {
        throw new ApiError(400, "Room does not belong to this property");
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

const getMyStay = AsyncHandler(async (req, res) => {
    const tenant = await Tenant.findOne({ user: req.user._id })
        .populate("property")
        .populate("room");

    if (!tenant) {
        return res.status(200).json(
            new ApiResponse(200, null, "You have not been assigned to any property yet.")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, tenant, "Stay details fetched successfully")
    );
});

export {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    assignTenantToRoom,
    removeTenantFromRoom,
    getMyStay
}