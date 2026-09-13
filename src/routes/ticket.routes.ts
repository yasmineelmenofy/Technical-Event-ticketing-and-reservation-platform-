import { Router } from "express";

import {
  createTicketController,
  fetchTicketByIdController,
  fetchTicketsByReservationController,
  fetchTicketsByUserController,
  removeTicketController,
} from "../controllers/ticket.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createTicketController);

router.get("/my", authenticate, fetchTicketsByUserController);

router.get(
  "/reservation/:reservationId",
  authenticate,
  fetchTicketsByReservationController,
);

router.get("/:id", authenticate, fetchTicketByIdController);

router.delete("/:id", authenticate, removeTicketController);

export default router;
