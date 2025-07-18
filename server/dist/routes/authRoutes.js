"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// When a POST request is made to /register, it will call the registerUser function
router.post("/register", authController_1.registerUser);
// When a POST request is made to /login, it will call the loginUser function
router.post("/login", authController_1.loginUser);
exports.default = router;
