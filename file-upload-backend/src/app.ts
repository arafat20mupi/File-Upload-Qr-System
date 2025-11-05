import compression from "compression";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { userRouter } from "./app/modules/user/user.route";
import fileRouter from "./app/modules/files/files.route";
dotenv.config();
const app = express();

// Middleware
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use("/api/user", userRouter)
app.use("/api/files", fileRouter);

// Default route for testing
app.get("/", (_req, res) => {
  res.send("API is running");
});


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;