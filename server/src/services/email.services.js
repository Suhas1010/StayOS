import "dotenv/config";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
})

const sendVerificationEmail = async(email,token)=>{
    const verificationUrl  = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await transporter.sendMail({
        from : process.env.EMAIL_USER,
        to : email,
        subject : "Verify your StayOS account",
        html : `
        <h2>Welcome to StayOS </h2>
        <p>Please verify your email address by clicking the link below:</p>
        
        <a href = "${verificationUrl}">
            verify Email </a>
        
        <p>This verification link will expire in 20 minutes. </p>
        
        `
    });
};

const sendPasswordResetEmail = async (email, token) => {

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your StayOS password",
        html: `
            <h2>Password Reset</h2>

            <p>We received a request to reset your StayOS password.</p>

            <p>Click the link below to reset your password:</p>

            <a href="${resetUrl}">
                Reset Password
            </a>

            <p>This password reset link will expire in 20 minutes.</p>

            <p>If you did not request this, you can safely ignore this email.</p>
        `
    });
};

export {sendVerificationEmail,sendPasswordResetEmail};

