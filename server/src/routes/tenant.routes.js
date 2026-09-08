import { Router } from "express";

import {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    assignTenantToRoom,
    removeTenantFromRoom
} from "../controllers/tenant.controller.js";

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
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        createTenant
    )
    .get(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        getTenants
    );


router.route("/:tenantId")
    .get(
        verifyRole(["OWNER", "CARETAKER", "TENANT"]),
        verifyTenantAccess,
        getTenantById
    )
    .patch(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        updateTenant
    )
    .delete(
        verifyRole(["OWNER"]),
        verifyPropertyAccess,
        deleteTenant
    );


router.route("/:tenantId/assign-room")
    .post(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyTenantAccess,
        assignTenantToRoom
    );


router.route("/:tenantId/remove-room")
    .post(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyTenantAccess,
        removeTenantFromRoom
    );


export default router;