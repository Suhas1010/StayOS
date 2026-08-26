import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    changePassword,
    refreshAccessToken,
    verifyEmail,
    resendEmailVerification,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login",loginUser);
router.post("/logout",verifyJWT,logoutUser);
router.get("/current-user",verifyJWT,getCurrentUser);
router.patch("/change-password",verifyJWT,changePassword);
router.post("/refresh-token",refreshAccessToken);
router.get("/verify-email/:verificationToken",verifyEmail);
router.post("/resend-verification",resendEmailVerification);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:resetPasswordToken", resetPassword);



export default router;