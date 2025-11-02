import compression from "compression";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./app/modules/user/user.route";
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use("/api/user" , userRouter)

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