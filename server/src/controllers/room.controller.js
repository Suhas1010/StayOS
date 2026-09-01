import Room from "../models/room.models.js";
import User from "../models/user.models.js";
import Property from "../models/property.models.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRoom = AsyncHandler(async(req,res)=>{
    const {propertyId} = req.params;
    const { roomNumber, capacity, rentAmount } = req.body;
    if(!roomNumber || !capacity || !rentAmount)
    {
        throw new ApiError(400,"All required details are needed")
    }
    const property = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404,"Property not found");
    }
    const room = new Room({
        roomNumber,
        capacity,
        rentAmount,
        property: propertyId
    });
    await room.save();
    return res.status(201).json(
        new ApiResponse(201,{},"Room created successfully")
    );
});

const getRooms = AsyncHandler(async(req,res)=>{
    const { propertyId } = req.params;
    const rooms = await Room.find({
        property : propertyId
    })
       if (rooms.length === 0) {
        throw new ApiError(404, "Rooms not found");
    }
    return res.status(200).json(
        new ApiResponse(200,rooms,"Rooms fetched successfully")
    )
});

const getRoomById = AsyncHandler(async(req,res)=>{
    const {roomId} = req.params;
     const room = await Room.findById(roomId);
    if(!room)
    {
        throw new ApiError(404,"Room does not exist ")
    }
    return res.status(200).json(
        new ApiResponse(200,room,"Room fetched by id successfully")
    )
});

const updateRoom = AsyncHandler(async(req,res)=>{
    const {roomId} = req.params;
    const { roomNumber, capacity, rentAmount } = req.body;
    const room = await Room.findById(roomId);

if (!room) {
    throw new ApiError(404, "room not found");
}

if (capacity < room.occupants.length) {
    throw new ApiError(
        400,
        "Capacity cannot be less than current occupants"
    );
}
    room.roomNumber = roomNumber;
    room.capacity = capacity;
    room.rentAmount = rentAmount;

await room.save();
     return res.status(200).json(
         new ApiResponse(200,room,"Updated room successfully")
      )  
});

const deleteRoom = AsyncHandler(async(req,res)=>{
     const {roomId} = req.params;
     const room = await Room.findByIdAndDelete(roomId);
     if(!room)
     {
            throw new ApiError(404, "room not found");
     }
      return res.status(200).json(
         new ApiResponse(200,room,"Room deleted successfully")
      )  
});

export {createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
}