import {
  addTicket,
  getTicketsByReservation,
  getTicketById,
  getTicketsByUser,
  deleteTicket,
} from "../models/ticket.model.js";

import { AppError } from "../utils/AppError.js";

import { getReservationById } from "../models/reservation.model.js";
import { getEventById } from "../models/event.model.js";
import { fetchSeatById } from "../services/seat.service.js";

import {
  getTicketPrice,
  TicketType,
} from "../models/eventTicketPrice.model.js";

import { getSeatHoldByEventAndSeat } from "../models/seatHold.model.js";

export async function createTicket(
  userId: number,
  role: "admin" | "customer",
  reservationId: number,
  eventId: number,
  seatId: number,
  type: TicketType,
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (reservation.event_id !== eventId) {
    throw new AppError(400, "Reservation does not belong to this event");
  }

  if (reservation.status !== "confirmed") {
    throw new AppError(
      400,
      "Ticket can only be created for a confirmed reservation",
    );
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  const seat = await fetchSeatById(seatId);

  if (seat.venue_id !== event.venue_id) {
    throw new AppError(400, "Seat does not belong to this event's venue");
  }

  const ticketPrice = await getTicketPrice(eventId, type);

  if (!ticketPrice) {
    throw new AppError(
      404,
      "Ticket price not found for this event and ticket type",
    );
  }

  const existingHold = await getSeatHoldByEventAndSeat(eventId, seatId);

  if (!existingHold) {
    throw new AppError(400, "Seat is not currently held");
  }

  if (new Date(existingHold.expires_at) <= new Date()) {
    throw new AppError(400, "Seat hold has expired");
  }

  if (existingHold.reservation_id !== reservationId) {
    throw new AppError(409, "Seat is held by another reservation");
  }

  const ticket = await addTicket(
    type,
    Number(ticketPrice.price),
    seatId,
    reservationId,
    eventId,
  );

  return ticket;
}

export async function fetchTicketById(
  ticketId: number,
  userId: number,
  role: "admin" | "customer",
) {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  const reservation = await getReservationById(ticket.reservation_id);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return ticket;
}

export async function fetchTicketsByReservation(
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

  return await getTicketsByReservation(reservationId);
}

export async function fetchTicketsByUser(userId: number) {
  return await getTicketsByUser(userId);
}

export async function removeTicket(
  ticketId: number,
  userId: number,
  role: "admin" | "customer",
) {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  const reservation = await getReservationById(ticket.reservation_id);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (reservation.status !== "cancelled") {
    throw new AppError(
      400,
      "Ticket cannot be removed while reservation is active",
    );
  }

  return await deleteTicket(ticketId);
}
