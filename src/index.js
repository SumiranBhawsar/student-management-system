import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server running on port ${process.env.PORT}`)  // Replace 'PORT' with the actual environment variable name for port number.
    })
})
.catch(error => {
    console.error(`Error connecting to the database: ${error?.message}`)
    process.exit(1)  // Exit the process with a non-zero status code.
})

