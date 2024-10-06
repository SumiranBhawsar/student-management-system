import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkAdminExists } from "../middlewares/checkAdminExists.middleware.js";
import { registerStudent } from "../controllers/student.controller.js";

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

router.route("/register-student").post(
    upload.fields([
        {
            name: "studentProfile",
            maxCount: 1 // only one file   
        }
    ]),
    registerStudent
)

export default router;