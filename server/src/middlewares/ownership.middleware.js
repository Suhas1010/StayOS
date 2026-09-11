import Property from "../models/property.models.js";
import Tenant from "../models/tenant.models.js";
import Complaint from "../models/complaint.models.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const verifyPropertyOwnership = AsyncHandler(async (req, res, next) => {

    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    if (property.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "The property does not belong to the particular owner"
        );
    }

    next();
});


const verifyCaretakerAssignment = AsyncHandler(async (req, res, next) => {

    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    if (
        !property.caretaker ||
        property.caretaker.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "The property does not belong to the particular caretaker"
        );
    }

    next();
});


const verifyPropertyAccess = AsyncHandler(async (req, res, next) => {

    const { propertyId } = req.params;

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
});


const verifyTenantAccess = AsyncHandler(async (req, res, next) => {

    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    const property = await Property.findById(tenant.property);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    const userId = req.user._id.toString();

    const isTenant =
        tenant.user.toString() === userId;

    const isOwner =
        property.owner.toString() === userId;

    const isCaretaker =
        property.caretaker &&
        property.caretaker.toString() === userId;

    if (!isTenant && !isOwner && !isCaretaker) {
        throw new ApiError(403, "Access denied");
    }

    next();
});
const verifyTenantPropertyAccess = AsyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;

    const tenant = await Tenant.findOne({
        user: req.user._id,
        property: propertyId
    });

    if (!tenant) {
        throw new ApiError(403, "You are not a tenant of this property");
    }

    next();
});
const verifyComplaintAccess = AsyncHandler(async (req, res, next) => {
    const { propertyId, complaintId } = req.params;

    const complaint = await Complaint.findOne({
        _id: complaintId,
        property: propertyId
    });

    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    const userId = req.user._id.toString();

    const isOwner = property.owner.toString() === userId;

    const isCaretaker =
        property.caretaker &&
        property.caretaker.toString() === userId;

    const isTenant = await Tenant.exists({
        _id: complaint.tenant,
        user: req.user._id,
        property: propertyId
    });

    if (!isOwner && !isCaretaker && !isTenant) {
        throw new ApiError(403, "Access denied");
    }

    next();
});
export {
    verifyPropertyOwnership,
    verifyCaretakerAssignment,
    verifyPropertyAccess,
    verifyTenantAccess,
    verifyTenantPropertyAccess,
    verifyComplaintAccess
};