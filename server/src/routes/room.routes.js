import { Router } from "express";
import {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
    verifyPropertyAccess,
    verifyPropertyOwnership
} from "../middlewares/ownership.middleware.js";


const router = Router({
    mergeParams: true
});
router.use(verifyJWT);

router.route("/")
    .get(verifyRole(["OWNER"]),verifyPropertyOwnership,getRooms)
    .post(verifyRole(["OWNER"]),verifyPropertyOwnership,createRoom)

router.route("/:roomId")
    .get(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,getRoomById)
    .patch(verifyRole(["OWNER"]),verifyPropertyOwnership,updateRoom)
    .delete(verifyRole(["OWNER"]),verifyPropertyOwnership,deleteRoom)

export default router;