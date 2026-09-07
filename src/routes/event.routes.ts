import {
  fetchAllEventsController,
  fetchEventByIdController,
  createEventController,
  modifyEventController,
  modifyEventStatusController,
} from "../controllers/event.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/", fetchAllEventsController);
router.get("/:id", fetchEventByIdController);
router.post("/", authenticate, authorize("admin"), createEventController);
router.put("/:id", authenticate, authorize("admin"), modifyEventController);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  modifyEventStatusController,
);

export default router;
