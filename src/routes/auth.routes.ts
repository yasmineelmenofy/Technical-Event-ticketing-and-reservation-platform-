import { Router } from "express";
import { refreshAccessTokenController } from "../controllers/auth.controller.js";
import { loginUserController,logoutController } from "../controllers/auth.controller.js";

const router = Router();


router.post('/refresh', refreshAccessTokenController);
router.post('/login', loginUserController);
router.post('/logout', logoutController);

export default router;