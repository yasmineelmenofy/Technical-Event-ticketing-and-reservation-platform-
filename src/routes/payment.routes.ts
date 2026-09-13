import { Router } from "express";

import {
  createPaymentController,
  fetchPaymentByIdController,
  fetchPaymentByReservationController,
  modifyPaymentStatusController,
} from "../controllers/payment.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

router.post(
  "/reservations/:reservationId",
  authenticate,
  createPaymentController,
);

router.get(
  "/reservations/:reservationId",
  authenticate,
  fetchPaymentByReservationController,
);

router.get("/:id", authenticate, fetchPaymentByIdController);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  modifyPaymentStatusController,
);

export default router;
