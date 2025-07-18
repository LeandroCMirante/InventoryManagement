import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = Router();

// When a POST request is made to /register, it will call the registerUser function
router.post("/register", registerUser);

// When a POST request is made to /login, it will call the loginUser function
router.post("/login", loginUser);

export default router;
