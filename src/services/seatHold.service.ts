import {
  addSeatHold,
  getSeatHoldById,
  getSeatHoldsByReservation,
  getSeatHoldByEventAndSeat,
  deleteSeatHold,
  getAvailableSeatsByEvent,
} from "../models/seatHold.model.js";

import { AppError } from "../utils/AppError.js";
import { getReservationById } from "../models/reservation.model.js";
import { getEventById } from "../models/event.model.js";
import { getSeatById } from "../models/seat.model.js";

export async function createSeatHold(
  userId: number,
  seatId: number,
  eventId: number,
  reservationId: number,
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (reservation.event_id !== eventId) {
    throw new AppError(400, "Reservation does not belong to this event");
  }

  if (reservation.status !== "pending") {
    throw new AppError(400, "Seat can only be held for a pending reservation");
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (event.status !== "published") {
    throw new AppError(400, "Seats cannot be held for this event");
  }

  const seat = await getSeatById(seatId);

  if (!seat) {
    throw new AppError(404, "Seat not found");
  }

  if (seat.venue_id !== event.venue_id) {
    throw new AppError(400, "Seat does not belong to this event's venue");
  }

  const existingHold = await getSeatHoldByEventAndSeat(eventId, seatId);

  if (existingHold && new Date(existingHold.expires_at) > new Date()) {
    throw new AppError(409, "Seat is currently held");
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const seatHold = await addSeatHold(seatId, eventId, reservationId, expiresAt);

  return seatHold;
}

export async function fetchSeatHoldById(seatHoldId: number, userId: number) {
  const seatHold = await getSeatHoldById(seatHoldId);

  if (!seatHold) {
    throw new AppError(404, "Seat hold not found");
  }

  const reservation = await getReservationById(seatHold.reservation_id);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return seatHold;
}

export async function fetchSeatHoldsByReservation(
  reservationId: number,
  userId: number,
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return await getSeatHoldsByReservation(reservationId);
}

export async function removeSeatHold(seatHoldId: number, userId: number) {
  const seatHold = await getSeatHoldById(seatHoldId);

  if (!seatHold) {
    throw new AppError(404, "Seat hold not found");
  }

  const reservation = await getReservationById(seatHold.reservation_id);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  return await deleteSeatHold(seatHoldId);
}

export async function fetchAvailableSeatsByEvent(eventId: number) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  return await getAvailableSeatsByEvent(eventId);
}
