import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const studentsSchema = new Schema(
    {
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        dob: {
            type: String,
            required: true,
        },
        enrollmentNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            // required: true,
        },
        studentProfile: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpiresAt: Date,
        verificationToken: String,
        verificationTokenExpiresAt: Date,
        refreshToken: {
            type: String,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);


studentsSchema.pre("save", async function (next) {
    const student = this;

    if (!student.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
    } catch (error) {
        next(error);
    }
});


studentsSchema.methods.isPasswordCorrect = async function (password) {
    const student = this;
    return await bcrypt.compare(password, student.password);
};

studentsSchema.methods.generateAccessToken = function () {
    const student = this;
    return jwt.sign(
        {
            _id: student._id,
            email: student.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};


studentsSchema.methods.generateRefreshToken = function () {
    const student = this;
    return jwt.sign(
        {
            _id: student._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};



export const Student = mongoose.model("Student", studentsSchema);
