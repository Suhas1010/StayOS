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
    verifyPropertyAccess
} from "../middlewares/ownership.middleware.js";


const router = Router({
    mergeParams: true
});
router.use(verifyJWT);

router.route("/")
    .get(verifyRole(["OWNER"]),getRooms)
    .post(verifyRole(["OWNER"]),createRoom)

router.route("/:roomId")
    .get(verifyRole(["OWNER","CARETAKER"]),verifyPropertyAccess,getRoomById)
    .put(verifyRole(["OWNER"]),updateRoom)
    .delete(verifyRole(["OWNER"]),deleteRoom)

export default router;