import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { emailValidator } from "../validations/email.validation.js";
import { Admin } from "../models/admin.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mail/emails.js";
import { Student } from "../models/student.model.js";



const registerStudent = asyncHandler( async (req, res) => {
    // get user details from req.body
    // validation -> not empty
    // chech if user is already exist
    // check for profilePicture
    // upload them to cloudinary server
    // check if profile picture is uploaded or not
    // create user object -> create entry in db
    // remove password nad refresh token feild from response
    // check for user creation
    // return response

    const {studentName, email, password, dob, enrollmentNumber} = req.body;

    console.log(studentName, email, dob, enrollmentNumber);

    if (
        [studentName, email, password, dob, enrollmentNumber].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const validatedEmail = emailValidator(email);

    if (!validatedEmail) {
        throw new ApiError(400, "Invalid email");
    }


    const studentProfilePictureLocalPath = req.files?.studentProfile[0]?.path;

    console.log(studentProfilePictureLocalPath);

    if (!studentProfilePictureLocalPath) {
        throw new ApiError(400, "PROFILE picture is REQUIRED");
    }

    const studentProfilePicture = await uploadOnCloudinary(studentProfilePictureLocalPath);

    if (!studentProfilePicture) {
        throw new ApiError(400, "Profile picture is required");
    }

    const students = await Student.findOne({email});

    if(students) {
        throw new ApiError(401, "Student are already exists");
    }

    const verificationToken = Math.floor(
        100000 + Math.random() * 900000
    ).toString();
    console.log(verificationToken);

    const student = await Student.create({
        studentName,
        email,
        password,
        dob,
        enrollmentNumber,
        studentProfile: studentProfilePicture.url,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    })

    const createdStudent = await Student.findById(student._id)
    .select(
        "-password -refreshToken"
    )

    if (!createdStudent) {
        throw new ApiError(500, "Server Error");
    }

    const sendedEmail = await sendVerificationEmail(createdStudent.email, createdStudent.verificationToken)

    console.log(sendedEmail);
    
    console.log(createdStudent);

    res.
    status(200)
    .json(
        new ApiResponse(
            200, 
            createdStudent, 
            "Student registered successfully"
        )
    )
})


const verifyStudentEmail = asyncHandler(async (req, res) => {
    // verification code from req.body
    // find the user that is hold the same verification code
    // if user not found throw error
    // verify user is not already verified
    // if user already verified throw error
    // update user status to verified
    // update user verification Token undefined
    // update user verificationTokenExpiresAt undefined
    // send welcome email to user

    const { code } = req.body;

    const student = await Student.findOne({
        $or: [
            { verificationToken: code },
            { verificationTokenExpiresAt: { $gt: Date.now() } },
        ],
    });

    if (student.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    student.isVerified = true;
    student.verificationToken = undefined;
    student.verificationTokenExpiresAt = undefined;

    await student.save();

    await sendWelcomeEmail(student.email, student.username);

    res.status(200).json(
        new ApiResponse(200, student, "User verified successfully")
    );
});

export {
    registerStudent,
    verifyStudentEmail
};