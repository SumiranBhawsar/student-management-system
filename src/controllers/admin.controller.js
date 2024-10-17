import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { emailValidator } from "../validations/email.validation.js";
import { Admin } from "../models/admin.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mail/emails.js";

const generateAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong While generating access token and refresh token."
        );
    }
};

const registerAdmin = asyncHandler(async (req, res) => {
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

    const { username, email, password, secreteKey } = req.body;

    console.log(username, email);

    if (
        [username, email, password, secreteKey].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const validatedEmail = emailValidator(email);

    if (!validatedEmail) {
        throw new ApiError(400, "Invalid email");
    }

    if (secreteKey !== process.env.ADMIN_LOGIN_SECRETE_KEY) {
        throw new ApiError(401, "SCRETE key are INVALID");
    }

    const profilePictureLocalPath = req.files?.profilePicture[0]?.path;

    console.log(profilePictureLocalPath);

    if (!profilePictureLocalPath) {
        throw new ApiError(400, "PROFILE picture is REQUIRED");
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    if (!profilePicture) {
        throw new ApiError(400, "Profile picture is required");
    }

    const verificationToken = Math.floor(
        100000 + Math.random() * 900000
    ).toString();
    console.log(verificationToken);

    const admin = await Admin.create({
        username: username.toLowerCase(),
        email,
        password,
        profilePicture: profilePicture.url,
        secreteKey,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken -secreteKey"
    );

    if (!createdAdmin) {
        throw new ApiError(500, "Server Error");
    }

    const sendedEmail = await sendVerificationEmail(
        createdAdmin.email,
        createdAdmin.verificationToken
    );

    console.log(sendedEmail);

    console.log(createdAdmin);

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdAdmin, "Admin registered successfully")
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
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

    const admin = await Admin.findOne({
        $or: [
            { verificationToken: code },
            { verificationTokenExpiresAt: { $gt: Date.now() } },
        ],
    });

    if (admin.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    admin.isVerified = true;
    admin.verificationToken = undefined;
    admin.verificationTokenExpiresAt = undefined;

    await admin.save();

    await sendWelcomeEmail(admin.email, admin.username);

    res.status(200).json(
        new ApiResponse(200, admin, "User verified successfully")
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
    // extrect data from body
    // validation not empty
    // email formate validate
    // find user in db
    // check password
    // generate jwt token, access and refresh token
    // send cookies
    // send response

    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const validatedEmail = emailValidator(email);

    if (!validatedEmail) {
        throw new ApiError(400, "Invalid email");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        admin._id
    );

    const loggedInAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInAdmin, accessToken, refreshToken },
                "Admin logged in successfully"
            )
        );
});

export { registerAdmin, verifyEmail, loginAdmin };
