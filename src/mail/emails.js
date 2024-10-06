import { ApiError } from "../utils/ApiError.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailTrap.config.js";

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
    
}