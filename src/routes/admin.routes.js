import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkAdminExists } from "../middlewares/checkAdminExists.middleware.js";

const router = Router();

router.route("/register").post(
    checkAdminExists,
    upload.fields([
        {
            name: "profilePicture",
            maxCount: 1 // only one file   
        }
    ]), // Multer middleware to handle file uploads
    registerAdmin
);

export default router;