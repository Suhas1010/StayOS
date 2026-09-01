import { Router } from "express";
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    assignCaretaker,
    deleteProperty
} from "../controllers/property.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
    verifyPropertyOwnership,
    verifyCaretakerAssignment,
    verifyPropertyAccess
} from "../middlewares/ownership.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
    .post(verifyRole(["OWNER"]),createProperty)
    .get(verifyRole(["OWNER"]),getProperties)

router.route("/:id")
    .get(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,getPropertyById)
    .patch(verifyRole(["OWNER"]),verifyPropertyOwnership,updateProperty)
    .delete(verifyRole(["OWNER"]),verifyPropertyOwnership,deleteProperty)

router.route("/:id/caretaker")
 .put(verifyRole(["OWNER"]),verifyPropertyOwnership,assignCaretaker);



export default router;