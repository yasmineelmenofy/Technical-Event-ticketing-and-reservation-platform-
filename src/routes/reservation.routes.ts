import { Router } from "express";
import {
  createReservationController,
  fetchReservationsController,
  modifyReservationStatusController,
} from "../controllers/reservation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { fetchReservationByIdController } from "../controllers/reservation.controller.js";

const router = Router();

router.post("/", authenticate, createReservationController);
router.get("/", authenticate, fetchReservationsController);
router.get("/:id", authenticate, fetchReservationByIdController);
router.patch("/:id/status", authenticate, modifyReservationStatusController);
export default router;
