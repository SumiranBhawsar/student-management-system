import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkAdminExists = asyncHandler( async (req, res, next) => {
    try {
        const adminCount = await Admin.countDocuments();

        if(adminCount > 0) {
            throw new ApiError(400, "Admin already exists you can not create more");
        }

        next();

    } catch (error) {
        throw new ApiError(400, "Admin already exists you can not create more");
    }
});

export { checkAdminExists };
