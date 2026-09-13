import {
  addTicket,
  getTicketById,
  getTicketsByReservation,
  getTicketsByUser,
  deleteTicket,
} from "../models/ticket.model.js";
import { AppError } from "../utils/AppError.js";
import { TicketType } from "../models/eventTicketPrice.model.js";
import { getReservationById } from "../models/reservation.model.js";
import { getEventById } from "../models/event.model.js";
import { getSeatById } from "../models/seat.model.js";
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
  const user_id = reservation.user_id;
  if (user_id != userId) {
    throw new AppError(403, "Forbidden to access resource");
  }
  const event =await  getEventById(eventId);
  if (!event) {
    throw new AppError(404, "Event not found");
    }
    const event_id = reservation.event_id;
    if (event_id != event_id) {
        throw new AppError(400, "The event not belong to the Reservation");
    }
    if (event.status != 'published') {
        throw new AppError(400, "The event is not published yet");
    }
    const seat = await getSeatById(seatId);
    if (!seat) {
        throw new AppError(404, "The seat is not found");
    }
    
}
