import { Router } from "express";

import {
  createSeatHoldController,
  fetchSeatHoldByIdController,
  fetchSeatHoldsByReservationController,
  removeSeatHoldController,
  fetchAvailableSeatsByEventController,
} from "../controllers/seatHold.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createSeatHoldController);

router.get(
  "/reservation/:reservationId",
  authenticate,
  fetchSeatHoldsByReservationController,
);

router.get(
  "/event/:eventId/available-seats",
  fetchAvailableSeatsByEventController,
);

router.get(
  "/:id",
  authenticate,
  fetchSeatHoldByIdController,
);

router.delete(
  "/:id",
  authenticate,
  removeSeatHoldController,
);

export default router;