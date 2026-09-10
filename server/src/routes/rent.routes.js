import { Router } from "express";
import {
   createRent,
    getRent,
    getRentById,
    updateRent,
    deleteRent,
    markRentAsPaid
} from "../controllers/rent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
    verifyPropertyAccess,verifyTenantAccess
} from "../middlewares/ownership.middleware.js";

const router = Router({
    mergeParams: true
});
router.use(verifyJWT);

router.route("/")
        .post(verifyRole(["OWNER", "CARETAKER"]),verifyPropertyAccess,createRent)
        .get(verifyRole(["OWNER","CARETAKER","TENANT"]),verifyTenantAccess,getRent)

router.route("/:rentId")
         .get( verifyRole(["OWNER", "CARETAKER", "TENANT"]),verifyTenantAccess, getRentById )
         .patch( verifyRole(["OWNER", "CARETAKER"]), verifyPropertyAccess, updateRent)
         .delete( verifyRole(["OWNER"]), verifyPropertyAccess, deleteRent)

router.route("/:rentId/pay")
    .post(
        verifyRole(["OWNER", "CARETAKER"]),
        verifyPropertyAccess,
        markRentAsPaid
    );

export default router;