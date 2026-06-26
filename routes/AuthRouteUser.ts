import { Router } from "express";
import { LoginUser, resisterUser } from "../controllers/AuthUser.js";

const router = Router();

router.post("/register", resisterUser);
router.post("/login", LoginUser);
export default router;