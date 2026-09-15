import Room from "../models/room.models.js";
import User from "../models/user.models.js";
import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import Complaint from "../models/complaint.models.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateComplaintStatus } from "../utils/complaint.validators.js";


const createComplaint = AsyncHandler(async(req,res)=>{

    const {title,description} = req.body;
    const {propertyId} = req.params;

    const property = await Property.findById(propertyId);

    if(!property)
    {
        throw new ApiError(404,"property not found");
    }

    const tenant = await Tenant.findOne({
        user: req.user._id,
        property: propertyId
    });

    if(!tenant)
    {
        throw new ApiError(404,"tenant not found");
    }

    const complaint = new Complaint({
        property: propertyId,
        tenant: tenant._id,
        title,
        description
    });

    await complaint.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            {},
            "Complaint created successfully"
        )
    );
});


const getComplaint = AsyncHandler(async(req,res)=>{
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if(page < 1 || limit < 1 || limit > 100)
    {
        throw new ApiError(400,"Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;

    const {search,status} = req.query;
    const {propertyId} = req.params;

    const property = await Property.findById(propertyId);

    if(!property)
    {
        throw new ApiError(404,"property not found");
    }
    const filter  = {
         property: propertyId
    };
    if(search)
    {
        filter.$or = [
            {
                title :{
                    $regex : search,
                    $options : "i"
                }
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            }
        ]
    }
       if(status)
    {
        filter.status = status;
    }

    const complaints = await Complaint.find(filter)
        .skip(skip)
        .limit(limit);

    const total = await Complaint.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);
    if(total === 0)
    {
        throw new ApiError(404,"No complaints found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
           { complaints,
            pagination :{
                   page,
                    limit,
                    total,
                    totalPages
            }
           },
            "complaints fetched successfully"
        )
    );
});


const getComplaintById = AsyncHandler(async(req,res)=>{

    const {complaintId,propertyId} = req.params;

    const complaint = await Complaint.findById(complaintId);

    if(!complaint)
    {
        throw new ApiError(404,"Complaint not found");
    }

    if(!complaint.property.equals(propertyId))
    {
        throw new ApiError(
            404,
            "The complaint does not belong to this property"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            complaint,
            "complaint fetched successfully"
        )
    );
});


const getMyComplaints = AsyncHandler(async(req,res)=>{

    const {propertyId} = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if(page < 1 || limit < 1 || limit > 100)
    {
        throw new ApiError(400,"Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;

    const {search,status} = req.query;

    const property = await Property.findById(propertyId);

    if(!property)
    {
        throw new ApiError(404,"property not found");
    }

    const tenant = await Tenant.findOne({
        user: req.user._id,
        property: propertyId
    });

    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }

    const filter = {
        tenant: tenant._id,
        property: propertyId
    };

    if(search)
    {
        filter.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    if(status)
    {
        filter.status = status;
    }

    const complaints = await Complaint.find(filter)
        .skip(skip)
        .limit(limit);

    const total = await Complaint.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);

    if(total === 0)
    {
        throw new ApiError(404,"Complaints not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                complaints,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            },
            "Complaints of the user fetched successfully"
        )
    );
});

const updateComplaintStatus = AsyncHandler(async(req,res)=>{

    const {status} = req.body;
    const {propertyId,complaintId} = req.params;

    const complaint = await Complaint.findById(complaintId);

    if(!complaint)
    {
        throw new ApiError(404,"Complaint not found");
    }

    if(!complaint.property.equals(propertyId))
    {
        throw new ApiError(
            404,
            "The complaint does not belong to this property"
        );
    }

    if(!validateComplaintStatus(status))
    {
        throw new ApiError(
            400,
            "Invalid complaint status"
        );
    }

    complaint.status = status;

    await complaint.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "complaint status updated successfully"
        )
    );
});


const deleteComplaint = AsyncHandler(async(req,res)=>{

    const {propertyId,complaintId} = req.params;

    const complaint = await Complaint.findById(complaintId);

    if(!complaint)
    {
        throw new ApiError(404,"Complaint not found");
    }

    if(!complaint.property.equals(propertyId))
    {
        throw new ApiError(
            404,
            "The complaint does not belong to this property"
        );
    }

    await Complaint.findByIdAndDelete(complaintId);

    return res.status(200).json(
        new ApiResponse(
            200,
            complaint,
            "complaint deleted successfully"
        )
    );
});


export {
    createComplaint,
    getComplaint,
    getComplaintById,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint
};