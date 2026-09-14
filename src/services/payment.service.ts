import {
  addPayment,
  getPaymentById,
  getPaymentByReservation,
  PaymentStatus,
} from "../models/payment.model.js";

import { AppError } from "../utils/AppError.js";

import { getReservationById } from "../models/reservation.model.js";
import { withTransaction } from "../config/database.js";
import {
  getSeatHoldsByReservation,
  deleteSeatHold,
} from "../models/seatHold.model.js";
import { addTicket } from "../models/ticket.model.js";
import { updateReservationStatus } from "../models/reservation.model.js";
import { getTicketPrice } from "../models/eventTicketPrice.model.js";

export async function fetchPaymentById(
  paymentId: number,
  userId: number,
  role: "admin" | "customer",
) {
  const payment = await getPaymentById(paymentId);

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const reservation = await getReservationById(payment.reservation_id);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return payment;
}

export async function fetchPaymentByReservation(
  reservationId: number,
  userId: number,
  role: "admin" | "customer",
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  const payment = await getPaymentByReservation(reservationId);

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  return payment;
}

export async function processPayment(
  userId: number,
  reservationId: number,
  transactionId: string,
  status: PaymentStatus,
) {
  return await withTransaction(async (client) => {
    const reservation = await getReservationById(reservationId, client);

    if (!reservation) {
      throw new AppError(404, "Reservation not found");
    }

    if (reservation.user_id !== userId) {
      throw new AppError(403, "Forbidden");
    }

    if (reservation.status !== "pending") {
      throw new AppError(
        400,
        "Payment can only be made for a pending reservation",
      );
    }

    const existingPayment = await getPaymentByReservation(
      reservationId,
      client,
    );

    if (existingPayment) {
      throw new AppError(409, "Payment already exists for this reservation");
    }

    const holds = await getSeatHoldsByReservation(reservationId, client);

    if (holds.length === 0) {
      throw new AppError(400, "Reservation has no active seat holds");
    }

    let amount = 0;

    for (const hold of holds) {
      if (new Date(hold.expires_at) <= new Date()) {
        throw new AppError(400, "One or more seat holds have expired");
      }

      const ticketPrice = await getTicketPrice(
        hold.event_id,
        hold.type,
        client,
      );

      if (!ticketPrice) {
        throw new AppError(404, "Ticket price not found");
      }

      amount += Number(ticketPrice.price);
    }

    const payment = await addPayment(
      reservationId,
      transactionId,
      amount,
      status,
      client,
    );

    if (status === "rejected") {
      return payment;
    }

    for (const hold of holds) {
      const ticketPrice = await getTicketPrice(
        hold.event_id,
        hold.type,
        client,
      );

      if (!ticketPrice) {
        throw new AppError(404, "Ticket price not found");
      }

      await addTicket(
        hold.type,
        Number(ticketPrice.price),
        hold.seat_id,
        hold.reservation_id,
        hold.event_id,
        client,
      );

      await deleteSeatHold(hold.id, client);
    }

    await updateReservationStatus(reservationId, "confirmed", client);

    return payment;
  });
}
