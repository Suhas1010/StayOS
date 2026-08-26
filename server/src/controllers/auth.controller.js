import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import { sendVerificationEmail,sendPasswordResetEmail} from "../services/email.services.js";
import { generateAccessAndRefreshTokens } from "../utils/generateToken.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const registerUser = AsyncHandler(async (req, res) => {

    const { fullName, email, password, phone, role } = req.body;
    if (!fullName || !email || !password || !phone || !role) {
    throw new ApiError(400, "All fields are required");
}
      const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }
     const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role
});

const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;

await user.save();

 await sendVerificationEmail(user.email, unhashedToken);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {},
                "User registered successfully. Please verify your email."
            )
        );
});
const loginUser = AsyncHandler(async (req, res) => {
    const {email,password} = req.body;
    if(!email || !password)
    {
        throw new ApiError(400,"Email and password are required");
    }
    const user = await User.findOne({email});
    if(!user)
    {
        throw new ApiError(404,"User not found");
    }
    if(!user.isEmailVerified)
    {
        throw new ApiError(400,"User is not verified");
    }
    const isPasswordValid = await bcrypt.compare(
    password,
    user.password
);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid credentials");
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
});
    res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
});
    return res.status(200)
              .json(
                new ApiResponse(200,{
                    accessToken,
                    user :{
                        _id : user._id,
                        fullName : user.fullName,
                        email : user.email,

                    }
                },"Login Successful")
              )
});

const logoutUser = AsyncHandler(async (req, res) => {
   const user = req.user;
     if(!user)
    {
        throw new ApiError(404,"User not found");
    }
    user.refreshToken = undefined;
    await user.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Logout successful"
        )
    );
});

const getCurrentUser = AsyncHandler(async (req, res) => {

    const user = req.user;
    if(!user)
    {
        throw new ApiError(404,"User not found");
    }
    return res.status(200)
            .json(
                new ApiResponse(200, {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        },"User details fetched")
            )
});

const changePassword = AsyncHandler(async (req, res) => {
    const {oldPassword,newPassword} = req.body;
     const user = req.user;
       if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!oldPassword || !newPassword) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }
    const isPasswordValid = await bcrypt.compare(
    oldPassword,
    user.password
);

if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
}
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await user.save();
     return res.status(200)
            .json(
                new ApiResponse(200,{},"Password changed successfully")
            )
});

const refreshAccessToken = AsyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const user = await User.findOne({
        refreshToken: incomingRefreshToken
    });

    if (!user) {
        throw new ApiError(401, "Refresh token is invalid");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    if (user._id.toString() !== decodedToken._id.toString()) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed successfully"
            )
        );
});


const verifyEmail = AsyncHandler(async (req, res) => {
    const {verificationToken} = req.params;
    if(!verificationToken){
        throw new ApiError(404,"Verfication Token not found");
    }
    const hashedToken = crypto
                        .createHash("sha256")
                        .update(verificationToken)
                        .digest("hex")
     const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() }
    });
    if(!user)
    {
        throw new ApiError(404,"User not found")
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Email verified successfully"
            )
        );
});

const resendEmailVerification = AsyncHandler(async (req, res) => {
    const {email} = req.body;
    if(!email)
    {
        throw new ApiError(404,"Email is required");
    }
    const user = await User.findOne({
        email
    })
    if (!user) {
    throw new ApiError(404, "User not found");
    }
    if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
    }
    const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;

await user.save();

 await sendVerificationEmail(user.email, unhashedToken);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Verification email sent successfully"
            )
        );
});

const forgotPassword = AsyncHandler(async (req, res) => {
     const {email} = req.body;
     if(!email)
     {
        throw new ApiError(400,"Email is required");
     }
     const user  = await User.findOne({email});
     if (!user) {
    throw new ApiError(404, "User not found");
}
     
    const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save();
    await sendPasswordResetEmail(email,unhashedToken);

    return res.status(200).json(
        new ApiResponse(200,{},"Forgot password email sent successfully")
    )
});

const resetPassword = AsyncHandler(async (req, res) => {
    const {resetPasswordToken} = req.params;
    const {newPassword} = req.body;
      if (!resetPasswordToken) {
        throw new ApiError(400, "Reset password token is required");
    }

    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");
    const user = await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {
            $gt : new Date()
        }
    })
    if(!user)
    {
        throw new ApiError(404,"Invalid or expired token");
    }
    const hashedNewPassword = await bcrypt.hash(newPassword,10);

    user.password  = hashedNewPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return res.status(200).json(
        new ApiResponse(200,{},"Password reset successfully")
    )
});

export {
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
};