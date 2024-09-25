import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { emailValidator } from "../validations/email.validation.js";
import { Admin } from "../models/admin.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
        throw new ApiError(401);
    }

    console.log(req.files);

    const profilePictureLocalPath = req.files?.profilePicture[0]?.path;

    if (!profilePicture) {
        throw new ApiError(400, "Profile picture is required");
    }

    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    if (!profilePicture) {
        throw new ApiError(400, "Profile picture is required");
    }

    const admin = await Admin.create({
        username: username.toLowerCase(),
        email,
        password,
        profilePicture,
        secreteKey,
    });

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    if (!createdAdmin) {
        throw new ApiError(500, "Server Error");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdAdmin, "Admin registered successfully")
        );
});

export { registerAdmin };
