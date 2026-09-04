import {
  getEventById,
  getAllEvents,
  addEvent,
  updateEvent,
  updateEventStatus,
  Status,
  Category,
} from "../models/event.model.js";
import { AppError } from "../utils/AppError.js";
import { getVenueById } from "../models/venue.model.js";

export async function fetchAllEvents(
  filters: {
    status?: Status;
    category?: Category;
    venue_id?: number;
  } = {},
  sort: "id" | "title" | "date" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = [
    "id",
    "title",
    "description",
    "category",
    "status",
    "date",
    "venue_id",
    "start_time",
    "end_time",
    "image",
  ],
) {
  const events = await getAllEvents(filters, sort, order, page, limit, fields);
  return events;
}

export async function fetchEventById(eventId: number) {
  const event = await getEventById(eventId);
  if (!event) {
    throw new AppError(404, "Evnet not found");
  }
  return event;
}

export async function createEvent(
  title: string,
  description: string | undefined,
  category: Category,
  status: Status,
  date: Date,
  venue_id: number,
  start_time: string,
  end_time: string,
  image: string | undefined,
) {
  const venue = await getVenueById(venue_id);
  if (!venue) {
    throw new AppError(404, "Venue not found");
  }
  const newEvent = await addEvent(
    title,
    description,
    category,
    status,
    date,
    venue_id,
    start_time,
    end_time,
    image,
  );
  return newEvent;
}

export async function modifyEvent(
  eventId: number,
  title: string,
  description: string | undefined,
  category: Category,
  status: Status,
  date: Date,
  venue_id: number,
  start_time: string,
  end_time: string,
  image: string | undefined,
) {
  const event = await getEventById(eventId);
  if (!event) {
    throw new AppError(404, "Evnet not found");
  }
  const venue = await getVenueById(venue_id);
  if (!venue) {
    throw new AppError(404, "Venue not found");
  }
  const updatedEvent = await updateEvent(
    eventId,
    title,
    description,
    category,
    status,
    date,
    venue_id,
    start_time,
    end_time,
    image,
  );
  return updatedEvent;
}

export async function modifyEventStatus(eventId: number, status: Status) {
  const event = await getEventById(eventId);
  if (!event) {
    throw new AppError(404, "Evnet not found");
  }
  const updatedEvent = await updateEventStatus(eventId, status);
  return updatedEvent;
}
