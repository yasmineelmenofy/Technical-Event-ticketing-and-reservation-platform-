import {
  fetchEventById,
  fetchAllEvents,
  createEvent,
  modifyEvent,
  modifyEventStatus,
} from "../services/event.service.js";
import { AppError } from "../utils/AppError.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Status, Category } from "../models/event.model.js";
const isValidDate = (dateStr: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return (
    d instanceof Date &&
    !isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === dateStr
  );
};
const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const isStartBeforeEnd = (date: string, start: string, end: string) => {
  const startDate = new Date(`${date}T${start}`);
  const endDate = new Date(`${date}T${end}`);
  return startDate < endDate;
};

const isValidId = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const isValidStatus = (value: unknown): value is Status =>
  value === "draft" ||
  value === "published" ||
  value === "cancelled" ||
  value === "completed";

const isValidCategory = (value: unknown): value is Category =>
  value === "conference" ||
  value === "workshop" ||
  value === "technical_meetup" ||
  value === "seminar" ||
  value === "training_session";

const isValidSort = (value: unknown): value is "id" | "title" | "date" =>
  value === "id" || value === "title" || value === "date";

const isValidOrder = (value: unknown): value is "asc" | "desc" =>
  value === "asc" || value === "desc";
export const fetchAllEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, category, venue_id } = req.query;
    const { sort, order } = req.query;
    const { page, limit } = req.query;
    const { fields } = req.query;
    const filters: {
      status?: Status;
      category?: Category;
      venue_id?: number;
    } = {};
    let Page = 1;
    let Limit = 10;

    if (page !== undefined) {
      Page = Number(page);

      if (!Number.isInteger(Page) || Page <= 0) {
        throw new AppError(400, "Invalid page number");
      }
    }
    if (limit !== undefined) {
      Limit = Number(limit);

      if (!Number.isInteger(Limit) || Limit <= 0 || Limit > 100) {
        throw new AppError(400, "Invalid limit. Must be between 1 and 100");
      }
    }
    if (status !== undefined) {
      if (!isValidStatus(status)) {
        throw new AppError(400, "Enter valid status");
      }
      filters.status = status;
    }

    if (category !== undefined) {
      if (!isValidCategory(category)) {
        throw new AppError(400, "Enter valid category");
      }
      filters.category = category;
    }

    if (venue_id !== undefined) {
      const parsedVenueId = Number(venue_id);
      if (!isValidId(parsedVenueId)) {
        throw new AppError(400, "Invalid venue id");
      }
      filters.venue_id = parsedVenueId;
    }
    if (sort !== undefined) {
      if (!isValidSort(sort)) {
        throw new AppError(400, "invalid sort option");
      }
    }
    if (order !== undefined) {
      if (!isValidOrder(order)) {
        throw new AppError(400, "invalid order option");
      }
    }
    let selectedFields: string[] | undefined;

    if (fields !== undefined) {
      if (typeof fields !== "string") {
        throw new AppError(400, "Invalid fields parameter");
      }

      selectedFields = fields.split(",").map((field) => field.trim());

      const allowedFields = [
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
      ];

      for (const field of selectedFields) {
        if (!allowedFields.includes(field)) {
          throw new AppError(400, `Invalid field: ${field}`);
        }
      }
    }
    const events = await fetchAllEvents(
      filters,
      sort,
      order,
      Page,
      Limit,
      selectedFields,
    );
    res.status(200).json({
      message: "Events retrieved successfully",
      data: events,
    });
  },
);

export const fetchEventByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }
    const event = await fetchEventById(eventId);
    res.status(200).json({
      message: "Event retrieved successfully",
      data: event,
    });
  },
);

export const createEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      status,
      date,
      venue_id,
      start_time,
      end_time,
      image,
    } = req.body;
    if (
      status !== "draft" &&
      status !== "published" &&
      status !== "cancelled" &&
      status !== "completed"
    ) {
      throw new AppError(400, "Enter valid status");
    }
    if (
      category !== "conference" &&
      category !== "workshop" &&
      category !== "technical_meetup" &&
      category !== "seminar" &&
      category !== "training_session"
    ) {
      throw new AppError(400, "Enter valid category");
    }
    if (
      !title ||
      !date ||
      venue_id === undefined ||
      venue_id === null ||
      !start_time ||
      !end_time
    ) {
      throw new AppError(400, "Enter complete information");
    }
    const venueId = Number(venue_id);
    if (!isValidId(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }
    if (!isValidDate(date)) {
      throw new AppError(400, "Invalid date format, expected YYYY-MM-DD");
    }
    if (!isValidTime(start_time) || !isValidTime(end_time)) {
      throw new AppError(400, "Invalid time format, expected HH:mm");
    }
    if (!isStartBeforeEnd(date, start_time, end_time)) {
      throw new AppError(400, "start_time must be before end_time");
    }
    const newEvent = await createEvent(
      title,
      description,
      category,
      status,
      date,
      venueId,
      start_time,
      end_time,
      image,
    );
    res.status(201).json({
      message: "Event created successfully",
      data: newEvent,
    });
  },
);

export const modifyEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      status,
      date,
      venue_id,
      start_time,
      end_time,
      image,
    } = req.body;
    const eventId = Number(req.params.id);
    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }
    if (
      status !== "draft" &&
      status !== "published" &&
      status !== "cancelled" &&
      status !== "completed"
    ) {
      throw new AppError(400, "Enter valid status");
    }
    if (
      category !== "conference" &&
      category !== "workshop" &&
      category !== "technical_meetup" &&
      category !== "seminar" &&
      category !== "training_session"
    ) {
      throw new AppError(400, "Enter valid category");
    }
    if (
      !title ||
      !date ||
      venue_id === undefined ||
      venue_id === null ||
      !start_time ||
      !end_time
    ) {
      throw new AppError(400, "Enter complete information");
    }
    const venueId = Number(venue_id);
    if (!isValidId(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }
    if (!isValidDate(date)) {
      throw new AppError(400, "Invalid date format, expected YYYY-MM-DD");
    }
    if (!isValidTime(start_time) || !isValidTime(end_time)) {
      throw new AppError(400, "Invalid time format, expected HH:mm");
    }
    if (!isStartBeforeEnd(date, start_time, end_time)) {
      throw new AppError(400, "start_time must be before end_time");
    }
    const updatedEvent = await modifyEvent(
      eventId,
      title,
      description,
      category,
      status,
      date,
      venueId,
      start_time,
      end_time,
      image,
    );
    res.status(200).json({
      message: "Event modified successfully",
      data: updatedEvent,
    });
  },
);

export const modifyEventStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const eventId = Number(req.params.id);
    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }
    if (
      status !== "draft" &&
      status !== "published" &&
      status !== "cancelled" &&
      status !== "completed"
    ) {
      throw new AppError(400, "Enter valid status");
    }
    const updatedEvent = await modifyEventStatus(eventId, status);
    res.status(200).json({
      message: "Event modified successfully",
      data: updatedEvent,
    });
  },
);
