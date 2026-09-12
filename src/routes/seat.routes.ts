import {
  createSeatController,
  fetchSeatByIdController,
  fetchSeatsByVenueController,
  modifySeatController,
  removeSeatController,
} from "../controllers/seat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/", authenticate, authorize("admin"), createSeatController);
router.get("/venue/:venueId", fetchSeatsByVenueController);
router.get("/:id", fetchSeatByIdController);
router.put("/:id", authenticate, authorize("admin"), modifySeatController);
router.delete("/:id", authenticate, authorize("admin"), removeSeatController);

export default router;
