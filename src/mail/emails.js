import { response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailTrap.config.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient
        .send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Verification email sent successfully", response);
        
    } catch (error) {
        throw new ApiError(401, `Error sending verification email : ${error.message}`)
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient
        .send({
            from: sender,
            to: recipient,
            subject: "Welcome to Collage Management System",
            html: `Welcome you are verified !! `,
            category: "Welcome Email"
        })

        console.log("Welcome email sent successfully", response);

        // res
        // .status(200)
        // .json(
        //     new ApiResponse(
        //         200,
        //         { email },
        //         "Welcome email sent successfully"
        //     )
        // )
        
    } catch (error) {
        throw new ApiError(401, `Error sending email : ${error.message}`);
    }
}