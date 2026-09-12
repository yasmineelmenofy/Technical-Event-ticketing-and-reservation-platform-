import {
  addTicketPrice,
  getTicketPrice,
  getTicketPricesByEvent,
  updateTicketPrice,
  deleteTicketPrice,
  TicketType,
} from "../models/eventTicketPrice.model.js";

import { AppError } from "../utils/AppError.js";
import { getEventById } from "../models/event.model.js";

const validTicketTypes: TicketType[] = [
  "regular",
  "vip",
  "student",
  "early_bird",
];

export async function createTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (!validTicketTypes.includes(type)) {
    throw new AppError(400, "Invalid ticket type");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new AppError(400, "Invalid price");
  }

  const existingPrice = await getTicketPrice(eventId, type);

  if (existingPrice) {
    throw new AppError(
      409,
      "Price for this ticket type already exists for this event",
    );
  }

  return await addTicketPrice(eventId, type, price);
}

export async function fetchTicketPricesByEvent(eventId: number) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  return await getTicketPricesByEvent(eventId);
}

export async function modifyTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (!validTicketTypes.includes(type)) {
    throw new AppError(400, "Invalid ticket type");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new AppError(400, "Invalid price");
  }

  const updatedPrice = await updateTicketPrice(eventId, type, price);

  if (!updatedPrice) {
    throw new AppError(404, "Ticket price not found");
  }

  return updatedPrice;
}

export async function removeTicketPrice(eventId: number, type: TicketType) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  const deletedPrice = await deleteTicketPrice(eventId, type);

  if (!deletedPrice) {
    throw new AppError(404, "Ticket price not found");
  }

  return deletedPrice;
}
