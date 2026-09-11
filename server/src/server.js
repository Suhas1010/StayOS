import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";



connectDB()
    .then(()=>{
        app.listen(process.env.PORT, ()=>{
            console.log(`🚀 Server running on port ${process.env.PORT}`)
        })
    })
    .catch((error)=>{
         console.error("❌ Database connection failed:", error);
    })

