import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import propertyRouter from "./routes/property.routes.js";
import roomRouter from "./routes/room.routes.js";
import tenantRouter from "./routes/tenant.routes.js";
import rentRouter from "./routes/rent.routes.js"
import complaintRouter from "./routes/complaint.routes.js"

const app = express();

// Basic configuration
app.use(express.json({ limit: "16kb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
);

app.use(express.static("public"));

app.use(cookieParser());

// CORS configuration
app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN?.split(",") ||
            "http://localhost:5173",

        credentials: true,

        methods: [ "GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS"    ],
        allowedHeaders: [ "Content-Type", "Authorization"]
    })
);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/properties/:propertyId/rooms", roomRouter);
app.use("/api/v1/properties/:propertyId/tenants", tenantRouter)
app.use("/api/v1/properties/:propertyId/tenants/:tenantId/rent",rentRouter)
app.use("/api/v1/properties/:propertyId/complaints",complaintRouter)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});
export default app;