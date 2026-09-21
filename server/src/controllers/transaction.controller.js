import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import Rent from "../models/rent.models.js";
import Transaction from "../models/transaction.models.js";

import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTransaction = AsyncHandler(async(req,res)=>{
    const { propertyId, tenantId, rentId } = req.params;
    const {
        amount,
        paymentDate,
        paymentMethod,
        transactionId
    } = req.body;
    const property   = await Property.findById(propertyId);
    if(!property)
    {
        throw new ApiError(404,"Property not found");
    }
    const tenant   = await Tenant.findById(tenantId);
    if(!tenant)
    {
        throw new ApiError(404,"Tenant not found");
    }
    
     if(!tenant.property.equals(propertyId))
    {
        throw new ApiError(403,"This property does not belong to the tenant");
    }
    const rent   = await Rent.findById(rentId);
    if(!rent)
    {
        throw new ApiError(404,"Rent not found");
    }
    if(!rent.property.equals(propertyId) || !rent.tenant.equals(tenantId))
    {
        throw new ApiError(403,"Unauthorized access");
    }
    if(rent.status === "PAID")
    {
        throw new ApiError(400,"Rent already paid");
    }
     if (Number(amount) !== rent.amount) {
        throw new ApiError(
            400,
            "Transaction amount must match the rent amount"
        );
    }
     const transaction = await Transaction.create({
        rent: rentId,
        tenant: tenantId,
        property: propertyId,
        amount: rent.amount,
        paymentDate,
        paymentMethod,
        transactionId
    });
    rent.status  = "PAID";
    await rent.save();
    return res.status(201).json(
        new ApiResponse(
            201,
            { transaction },
            "Transaction created successfully"
        )
    ); 
});
const getTransactions = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId} = req.params;
    const page  = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if(page<1 || limit<1 || limit>100)
    {
        throw new ApiError(400,"Invalid pagination parameters");
    }
     const skip = (page - 1) * limit;
      const { status,paymentMethod } = req.query;
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
    if(paymentMethod)
    {
        filter.paymentMethod  = paymentMethod;
    }
     const transactions = await Transaction.find(filter)
                               .sort({paymentDate : -1})
                               .skip(skip)
                               .limit(limit);
     const total = await Transaction.countDocuments(filter);

    const totalPages = Math.ceil(total / limit) || 0;

    return res.status(200).json(
    new ApiResponse(200, {transactions,pagination :{
         page,
         limit,
         total,
         totalPages
    }}, "Transactions fetched successfully")
);
});
const getTransactionById = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId,transactionId} = req.params;
    const transaction = await Transaction.findById(transactionId);
    if(!transaction)
    {
        throw new ApiError(404,"Transaction not found");
    }
    if(!transaction.property.equals(propertyId))
    {
        throw new ApiError(403,"Unauthorized access");
    }
    if(!transaction.tenant.equals(tenantId))
    {
        throw new ApiError(403,"Unauthorized access");
    }
    return res.status(200).json(
        new ApiResponse(200,transaction,"Transaction fetched by id successfully")
    );
});
const updateTransaction = AsyncHandler(async(req,res)=>{
    const {propertyId,tenantId,transactionId} = req.params;
    const{paymentDate,paymentMethod,paymentTransactionId} = req.body;
    const transaction = await Transaction.findById(transactionId);
    if(!transaction)
    {
        throw new ApiError(404,"Transaction not found");
    }
    if(!transaction.property.equals(propertyId))
    {
        throw new ApiError(403,"Unauthorized error");
    }
    if(!transaction.tenant.equals(tenantId))
    {
        throw new ApiError(403,"Unauthorized access")
    }
    if(paymentDate)
    {
        transaction.paymentDate = paymentDate;
    }
    if(paymentMethod)
    {
        transaction.paymentMethod = paymentMethod;
    }
    if(paymentTransactionId)
    {
        transaction.transactionId = paymentTransactionId;
    }
    await transaction.save();
    return res.status(200).json(
        new ApiResponse(200,transaction,"Transaction updated successfully")
    );
});

const getMyTransactions = AsyncHandler(async(req,res)=>{
     const {propertyId} = req.params;
     const userId = req.user._id;
      const page  = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if(page<1 || limit<1 || limit>100)
    {
        throw new ApiError(400,"Invalid pagination parameters");
    }
     const skip = (page - 1) * limit;
      const { status,paymentMethod } = req.query;
    const property = await Property.findById(propertyId);
     if(!property)
    {
        throw new ApiError(404, "Property not found");
    }   
    const tenant = await Tenant.findOne({
        user : userId
    });

    if(!tenant)
    {
        throw new ApiError(404, "Tenant not found");
    }
    if(!tenant.property.equals(propertyId))
    {
        throw new ApiError(403, "This property does not belong to the tenant");
    }
     const filter = {
        tenant : tenant._id,
        property : propertyId
    }
    if(status)
    {
        filter.status = status;
    }
    if(paymentMethod)
    {
        filter.paymentMethod  = paymentMethod;
    }
     const transactions = await Transaction.find(filter)
                               .sort({paymentDate : -1})
                               .skip(skip)
                               .limit(limit);
     const total = await Transaction.countDocuments(filter);

    const totalPages = Math.ceil(total / limit) || 0;

    return res.status(200).json(
    new ApiResponse(200, {transactions,pagination :{
         page,
         limit,
         total,
         totalPages
    }}, "Transactions fetched successfully")
);
});
export {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    getMyTransactions
}