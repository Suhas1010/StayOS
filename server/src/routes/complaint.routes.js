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
    verifyTenantAccess,
    verifyTenantPropertyAccess,
    verifyComplaintAccess
} from "../middlewares/ownership.middleware.js";


const router = Router({
    mergeParams: true
});


router.use(verifyJWT);


router.route("/")
    .post(
        verifyRole(["TENANT"]),
        verifyTenantPropertyAccess,
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
        verifyTenantPropertyAccess,
        getMyComplaints
    );


router.route("/:complaintId")
    .get(
        verifyRole(["OWNER", "CARETAKER", "TENANT"]),
         verifyComplaintAccess,
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