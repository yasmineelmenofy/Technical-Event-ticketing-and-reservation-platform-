import { Router } from "express";
import {
  fetchAllUsersController,
  fetchUserByIdController,
  registerUserController,
  updateUserController,
  deleteUserController,
  fetchMyProfileController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), fetchAllUsersController);
router.get("/me", authenticate, fetchMyProfileController);
router.get("/:id", authenticate, authorize("admin"), fetchUserByIdController);
router.post("/register", registerUserController);
router.put("/:id", authenticate, authorize("admin"), updateUserController);
router.delete("/:id", authenticate, authorize("admin"), deleteUserController);

export default router;
