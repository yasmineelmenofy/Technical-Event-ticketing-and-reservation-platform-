import {
  addSeat,
  getSeatsByVenue,
  getSeatById,
  updateSeat,
  deleteSeat,
} from "../models/seat.model.js";

import { AppError } from "../utils/AppError.js";
import { getVenueById } from "../models/venue.model.js";
import { TicketType } from "../models/eventTicketPrice.model.js";

export async function createSeat(
  row: string,
  section: string,
  seat_number: number,
  venue_id: number,
  type: TicketType,
) {
  const venue = await getVenueById(venue_id);

  if (!venue) {
    throw new AppError(404, "Venue not found");
  }

  const newSeat = await addSeat(row, section, seat_number, venue_id, type);

  return newSeat;
}

export async function fetchSeatsByVenue(venueId: number) {
  const venue = await getVenueById(venueId);

  if (!venue) {
    throw new AppError(404, "Venue not found");
  }

  return await getSeatsByVenue(venueId);
}

export async function fetchSeatById(seatId: number) {
  const seat = await getSeatById(seatId);

  if (!seat) {
    throw new AppError(404, "Seat not found");
  }

  return seat;
}

export async function modifySeat(
  seatId: number,
  row: string,
  section: string,
  seat_number: number,
  type: TicketType,
) {
  const seat = await getSeatById(seatId);

  if (!seat) {
    throw new AppError(404, "Seat not found");
  }

  const updatedSeat = await updateSeat(seatId, row, section, seat_number, type);

  return updatedSeat;
}

export async function removeSeat(seatId: number) {
  const seat = await getSeatById(seatId);

  if (!seat) {
    throw new AppError(404, "Seat not found");
  }

  const deletedSeat = await deleteSeat(seatId);

  return deletedSeat;
}
