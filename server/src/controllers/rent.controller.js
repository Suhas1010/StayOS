import mongoose from "mongoose";
import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import Rent from "../models/rent.models.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRent = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const {amount,dueDate} = req.body;
    const property = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404,"Property not found");
    }
    const tenant = await Tenant.findById(tenantId);
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    if(!tenant.property.equals(propertyId))   
    {
        throw new ApiError(403,"This property does not belong to the tenant");
    }
    const rent = new Rent({
            tenant : tenantId,
            property : propertyId,
            amount,
            dueDate
        })
        await rent.save();
        return res.status(201).json(
            new ApiResponse(201,{},"Rent created successfully")
        )
});

const getRent = AsyncHandler(async(req,res)=>{ 
    const { propertyId, tenantId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if(page < 1 || limit < 1 || limit > 100)
    {
        throw new ApiError(400,"Invalid pagination parameters");
    }

    const skip = (page - 1) * limit;

    const { status } = req.query;
    const property = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404, "Property not found");
    }   
    const tenant = await Tenant.findById(tenantId);

    if(!tenant)
    {
        throw new ApiError(404, "Tenant not found");
    }
    if(!tenant.property.equals(propertyId))
    {
        throw new ApiError(403, "This property does not belong to the tenant");
    }
    const filter = {
         tenant : tenantId,
        property : propertyId
    }
     if(status)
    {
        filter.status = status;
    }

    const rent = await Rent.find(filter)
                           .sort({ dueDate: -1 })
                           .skip(skip)
                           .limit(limit);
    const total = await Rent.countDocuments(filter);

    const totalPages = Math.ceil(total / limit) || 0;

    return res.status(200).json(
    new ApiResponse(200, {rent,pagination :{
         page,
         limit,
         total,
         totalPages
    }}, "Rent fetched successfully")
);
})

const getRentById = AsyncHandler(async(req,res)=>{
    const {rentId,propertyId,tenantId} = req.params;
    const rent = await Rent.findById(rentId);
    if(!rent)
    {
        throw new ApiError(404,"Rent not found");
    }
    if(!rent.property.equals(propertyId))
    {
        throw new ApiError(403,"This rent does not belong to this property");
    }
    if(!rent.tenant.equals(tenantId))
    {
        throw new ApiError(403,"This rent does not belong to this tenant");
    }
    return res.status(200).json(
        new ApiResponse(200, rent, "Rent fetched successfully")
    );
})

const updateRent = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId,rentId} = req.params;
    const rent = await Rent.findById(rentId);
    if(!rent)
    {
        throw new ApiError(404,"Rent not found");
    }
    if(!rent.property.equals(propertyId))
    {
        throw new ApiError(403,"This rent does not belong to this property");
    }
    if(!rent.tenant.equals(tenantId))
    {
        throw new ApiError(403,"This rent does not belong to this tenant");
    }
    const {amount,dueDate,status} = req.body;

    if(amount !== undefined)
    {
        rent.amount = amount;
    }

    if(dueDate !== undefined)
    {
        rent.dueDate = dueDate;
    }

    if(status !== undefined)
    {
        rent.status = status;
    }

    await rent.save();

    return res.status(200).json(
        new ApiResponse(200,rent,"Rent updated successfully")
    );
});

const deleteRent = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId,rentId} = req.params;
    const rent = await Rent.findById(rentId);
    if(!rent)
    {
        throw new ApiError(404,"Rent not found");
    }
    if(!rent.property.equals(propertyId))
    {
        throw new ApiError(403,"This rent does not belong to this property");
    }
    if(!rent.tenant.equals(tenantId))
    {
        throw new ApiError(403,"This rent does not belong to this tenant");
    }
    await Rent.findByIdAndDelete(rentId);
    return res.status(200).json(
        new ApiResponse(200,rent,"Rent deleted successfully")
    );
});

const markRentAsPaid = AsyncHandler(async(req,res)=>{
   const {propertyId,tenantId,rentId} = req.params;
   const rent = await Rent.findById(rentId);
   if(!rent)
    {
        throw new ApiError(404,"Rent not found");
    }
    if(!rent.property.equals(propertyId))
    {
        throw new ApiError(403,"This rent does not belong to this property");
    }
    if(!rent.tenant.equals(tenantId))
    {
        throw new ApiError(403,"This rent does not belong to this tenant");
    }
    rent.status = "PAID";
    await rent.save();
    return res.status(200).json(
        new ApiResponse(200,rent,"Rent marked as paid")
    );
});
const getRentLedger = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const property = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404,"Property not found");
    }
    const tenant = await Tenant.findById(tenantId);
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    if(!tenant.property.equals(propertyId))
{
    throw new ApiError(403,"This property does not belong to the tenant");
}
    const ledger = await Rent.aggregate([{
        $match:{
            tenant : new mongoose.Types.ObjectId(tenantId),
            property : new mongoose.Types.ObjectId(propertyId)
        }

    },
    {
        $group :{
            _id : null,
            totalRent :{
                $sum : "$amount"
            },
            totalPaid :{
                $sum :{
                    $cond: [
                            { $eq: ["$status", "PAID"] },
                            "$amount",
                            0
                        ]
                }
            },
            totalPending :{
                $sum:{
                    $cond :[
                        {$eq : ["$status","PENDING"] },
                        "$amount",
                        0
                    ]
                }
            },
            totalOverdue :{
                $sum :{
                    $cond :[
                        {$eq : ["$status","OVERDUE"] },
                        "$amount",
                        0
                    ]
                }
            }
        }
    }
]);
    if(ledger.length === 0)
    {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalRent: 0,
                    totalPaid: 0,
                    totalPending: 0,
                    totalOverdue: 0,
                    outstanding: 0
                },
                "Rent ledger fetched successfully"
            )
        );
    }

    const {
        totalRent,
        totalPaid,
        totalPending,
        totalOverdue
    } = ledger[0];

    const outstanding = totalPending + totalOverdue;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalRent,
                totalPaid,
                totalPending,
                totalOverdue,
                outstanding
            },
            "Rent ledger fetched successfully"
        )
    );
})
export {
    createRent,
    getRent,
    getRentById,
    updateRent,
    deleteRent,
    markRentAsPaid,
    getRentLedger
}