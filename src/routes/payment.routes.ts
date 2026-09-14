import { Router } from "express";

import {
  processPaymentController,
  fetchPaymentByIdController,
  fetchPaymentByReservationController,
} from "../controllers/payment.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/reservations/:reservationId",
  authenticate,
  processPaymentController,
);

router.get(
  "/reservations/:reservationId",
  authenticate,
  fetchPaymentByReservationController,
);

router.get("/:id", authenticate, fetchPaymentByIdController);

export default router;
