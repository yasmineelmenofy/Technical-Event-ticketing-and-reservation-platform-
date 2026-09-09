import {
  addReservation,
  getAllReservations,
  getReservationsByUser,
  getReservationById,
  updateReservationStatus,
} from "../models/reservation.model.js";
import { AppError } from "../utils/AppError.js";
import { getEventById } from "../models/event.model.js";
import { getUserById } from "../models/user.model.js";

export async function createReservation(userId: number, eventId: number) {
  const event = await getEventById(eventId);
  if (!event) {
    throw new AppError(404, "Event not found");
  }
  if (event.status !== "published") {
    throw new AppError(400, "Reservations are not available for this event");
  }
  const newReservation = await addReservation(userId, eventId);
  return newReservation;
}

export async function fetchReservationsByUser(
  userId: number,
  filters: {
    status?: "pending" | "confirmed" | "cancelled";
    event_id?: number;
  } = {},
  sort: "id" | "created_at" | "status" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = ["id", "user_id", "event_id", "created_at", "status"],
) {
  return await getReservationsByUser(
    userId,
    filters,
    sort,
    order,
    page,
    limit,
    fields,
  );
}

export async function fetchAllReservations(
  filters: {
    status?: "pending" | "confirmed" | "cancelled";
    event_id?: number;
  } = {},
  sort: "id" | "created_at" | "status" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = ["id", "user_id", "event_id", "created_at", "status"],
) {
  return await getAllReservations(filters, sort, order, page, limit, fields);
}

export async function fetchReservationById(
  reservationId: number,
  userId: number,
  role: "admin" | "customer",
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role !== "admin" && reservation.user_id !== userId) {
    throw new AppError(
      403,
      "Forbidden: You can only access your own reservation",
    );
  }

  return reservation;
}

export async function modifyReservationStatus(
  reservationId: number,
  userId: number,
  role: "admin" | "customer",
  newStatus: "pending" | "confirmed" | "cancelled",
) {
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (role === "customer" && reservation.user_id !== userId) {
    throw new AppError(403, "Forbidden");
  }

  if (role === "customer" && newStatus !== "cancelled") {
    throw new AppError(403, "Customers can only cancel reservations");
  }

  if (reservation.status === "cancelled" && newStatus !== "cancelled") {
    throw new AppError(400, "Cancelled reservation cannot be changed");
  }

  if (reservation.status === "confirmed" && newStatus === "pending") {
    throw new AppError(400, "Confirmed reservation cannot return to pending");
  }

  const updatedReservation = await updateReservationStatus(
    reservationId,
    newStatus,
  );

  return updatedReservation;
}
