import express from "express";
import { createUser, login } from "./user.controller";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);


export const userRouter = router;