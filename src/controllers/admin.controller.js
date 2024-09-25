import { asyncHandler } from "../utils/asyncHandler.js";


const registerAdmin = asyncHandler( async (req, res) => {
    res.status(200)
    .json({
        message: "Student Management System"
    })
});


export { registerAdmin };