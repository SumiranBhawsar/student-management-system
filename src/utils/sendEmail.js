import nodemailer from "nodemailer";
import { asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.BACKEND_DEVELOPER_EMAIL,
        pass: process.env.BACKEND_DEVELOPER_EMAIL_password,
    },
});

const sendEmail = async (toEmail, subject, message) => {
    try {
        const mailOptions = {
            from: process.env.BACKEND_DEVELOPER_EMAIL,
            to: toEmail,
            subject: subject,
            text: message,
        };

        const emailTransferedTo = await transporter.sendEmail(mailOptions);
        console.log(emailTransferedTo);

        console.log('Email sent successfully to owner');
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid email address");
    }
};


export { sendEmail };