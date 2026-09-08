import { Router } from "express";

import {
    createComplaint,
    getComplaint,
    getComplaintById,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint
} from "../controllers/complaint.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

import {
    verifyPropertyAccess,
    verifyTenantAccess
} from "../middlewares/ownership.middleware.js";


const router = Router({
    mergeParams: true
});


router.use(verifyJWT);


router.route("/")
    .post(
        verifyRole(["TENANT"]),
        verifyTenantAccess,
        createComplaint
    )
    .get(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        getComplaint
    );


router.route("/my-complaints")
    .get(
        verifyRole(["TENANT"]),
        verifyTenantAccess,
        getMyComplaints
    );


router.route("/:complaintId")
    .get(
        verifyRole(["OWNER", "CARETAKER", "TENANT"]),
        verifyTenantAccess,
        getComplaintById
    )
    .delete(
        verifyRole(["OWNER"]),
        verifyPropertyAccess,
        deleteComplaint
    );


router.route("/:complaintId/status")
    .patch(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        updateComplaintStatus
    );


export default router;