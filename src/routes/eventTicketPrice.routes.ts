import { Router } from "express";

import {
  createTicketPriceController,
  fetchTicketPricesController,
  modifyTicketPriceController,
  removeTicketPriceController,
} from "../controllers/eventTicketPrice.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

router.get("/events/:eventId/ticket-prices", fetchTicketPricesController);

router.post(
  "/events/:eventId/ticket-prices",
  authenticate,
  authorize("admin"),
  createTicketPriceController,
);

router.put(
  "/events/:eventId/ticket-prices/:type",
  authenticate,
  authorize("admin"),
  modifyTicketPriceController,
);

router.delete(
  "/events/:eventId/ticket-prices/:type",
  authenticate,
  authorize("admin"),
  removeTicketPriceController,
);

export default router;
