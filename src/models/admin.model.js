import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            toLowerCase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            toLowerCase: true,
            index: true,
        },
        profilePicture: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        secreteKey: {
            type: String,
            required: true,
            trim: true,
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

adminSchema.pre("save", async function (next) {
    const admin = this;

    if (!admin.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(admin.password, salt);
    } catch (error) {
        next(error);
    }
});

adminSchema.methods.isPasswordCorrect = async function (password) {
    const admin = this;
    return await bcrypt.compare(password, admin.password);
};

adminSchema.methods.generateAccessToken = function () {
    const admin = this;
    return jwt.sign(
        {
            _id: admin._id,
            email: admin.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};


adminSchema.methods.generateRefreshToken = function () {
    const admin = this;
    return jwt.sign(
        {
            _id: admin._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};



export const Admin = mongoose.model("Admin", adminSchema);
