import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";
import { env } from "process";

// cloudinary configuration setting ye apko file upload karne ki permission deta he

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file upload kese karte he

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            public_id: "profileImage",
            resource_type: "auto",
        });

        console.log(
            "File is uploaded on cloudinary successfull : ",
            response.url
        );

        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
