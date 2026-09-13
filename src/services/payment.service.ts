import {
  addPayment,
  getPaymentById,
  getPaymentByReservation,
  updatePaymentStatus,
  PaymentStatus,
} from "../models/payment.model.js";

import { AppError } from "../utils/AppError.js";

import { getReservationById } from "../models/reservation.model.js";
import { getTicketsByReservation } from "../models/ticket.model.js";

export async function createPayment(
  userId: number,
  reservationId: number,
  transactionId: string,
  status: PaymentStatus,
) {
  const reservation = await getReservationById(reservationId);

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

  const existingPayment = await getPaymentByReservation(reservationId);

  if (existingPayment) {
    throw new AppError(409, "Payment already exists for this reservation");
  }

  const tickets = await getTicketsByReservation(reservationId);

  if (tickets.length === 0) {
    throw new AppError(400, "Reservation has no tickets");
  }

  const amount = tickets.reduce(
    (total, ticket) => total + Number(ticket.price),
    0,
  );

  const payment = await addPayment(
    reservationId,
    transactionId,
    amount,
    status,
  );

  return payment;
}

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

export async function modifyPaymentStatus(
  paymentId: number,
  status: PaymentStatus,
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

  if (payment.status === "accepted" && status === "rejected") {
    throw new AppError(400, "Accepted payment cannot be changed to rejected");
  }

  return await updatePaymentStatus(paymentId, status);
}
