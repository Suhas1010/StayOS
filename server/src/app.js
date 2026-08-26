import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

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

export default app;