import mongoose, { Schema } from "mongoose";


const departmentSchema = new Schema(
    {
        departmentName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        departmentHOD: {
            type: Schema.Types.ObjectId,
            ref: "Hod"
        }, 
    },
    {
        timestamps: true
    } 
);


export const Department = mongoose.model("Department", departmentSchema);