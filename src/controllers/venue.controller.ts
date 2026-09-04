import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  fetchAllVenues,
  fetchVenueById,
  createVenue,
  modifyVenue,
  modifyVenueStatus,
} from "../services/venue.service.js";
import { Request, Response } from "express";
import { Status } from "../models/venue.model.js";

export const fetchAllVenuesController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      status,
      location,
      min_capacity,
      max_capacity,
      sort,
      order,
      page,
      limit,
      fields,
    } = req.query;

    const filters: {
      status?: Status;
      location?: string;
      min_capacity?: number;
      max_capacity?: number;
    } = {};

    let Page = 1;
    let Limit = 10;
    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        (status !== "active" && status !== "inactive")
      ) {
        throw new AppError(400, "Enter valid status");
      }

      filters.status = status;
    }
    if (location !== undefined) {
      if (typeof location !== "string" || location.trim() === "") {
        throw new AppError(400, "Invalid location");
      }

      filters.location = location.trim();
    }
    if (min_capacity !== undefined) {
      if (typeof min_capacity !== "string") {
        throw new AppError(400, "Invalid minimum capacity");
      }

      const minCapacity = Number(min_capacity);

      if (!Number.isInteger(minCapacity) || minCapacity < 0) {
        throw new AppError(400, "Invalid minimum capacity");
      }

      filters.min_capacity = minCapacity;
    }
    if (max_capacity !== undefined) {
      if (typeof max_capacity !== "string") {
        throw new AppError(400, "Invalid maximum capacity");
      }

      const maxCapacity = Number(max_capacity);

      if (!Number.isInteger(maxCapacity) || maxCapacity < 0) {
        throw new AppError(400, "Invalid maximum capacity");
      }

      filters.max_capacity = maxCapacity;
    }

    if (
      filters.min_capacity !== undefined &&
      filters.max_capacity !== undefined &&
      filters.min_capacity > filters.max_capacity
    ) {
      throw new AppError(
        400,
        "Minimum capacity cannot be greater than maximum capacity",
      );
    }
    let validatedSort: "id" | "name" | "capacity" = "id";
    let validatedOrder: "asc" | "desc" = "asc";

    if (sort !== undefined) {
      if (
        typeof sort !== "string" ||
        (sort !== "id" && sort !== "name" && sort !== "capacity")
      ) {
        throw new AppError(400, "Invalid sort option");
      }

      validatedSort = sort;
    }

    if (order !== undefined) {
      if (typeof order !== "string" || (order !== "asc" && order !== "desc")) {
        throw new AppError(400, "Invalid order option");
      }

      validatedOrder = order;
    }
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
    let selectedFields: string[] | undefined;

    if (fields !== undefined) {
      if (typeof fields !== "string") {
        throw new AppError(400, "Invalid fields parameter");
      }

      selectedFields = fields.split(",").map((field) => field.trim());

      const allowedFields = [
        "id",
        "name",
        "location",
        "capacity",
        "description",
        "status",
      ];

      for (const field of selectedFields) {
        if (!allowedFields.includes(field)) {
          throw new AppError(400, `Invalid field: ${field}`);
        }
      }
    }

    const venues = await fetchAllVenues(
      filters,
      validatedSort,
      validatedOrder,
      Page,
      Limit,
      selectedFields,
    );

    res.status(200).json({
      message: "Venues retrieved successfully",
      data: venues,
    });
  },
);
export const fetchVenueByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const venueId = Number(req.params.id);
    if (isNaN(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }
    const venue = await fetchVenueById(venueId);
    res.status(200).json({
      message: "Venue retrieved successfully",
      data: venue,
    });
  },
);

export const createVenueController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, location, capacity, description, status } = req.body;
    if (status !== "active" && status !== "inactive") {
      throw new AppError(400, "Enter valid status");
    }
    if (!name || !location || capacity === undefined || capacity === null) {
      throw new AppError(400, "The information of Venue is not complete");
    }
    const venue = await createVenue(
      name,
      location,
      capacity,
      description,
      status,
    );
    res.status(201).json({
      message: "Venue Created successfully",
      data: venue,
    });
  },
);

export const modifyVenueController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, location, capacity, description, status } = req.body;
    const venueId = Number(req.params.id);
    if (isNaN(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }
    if (status !== "active" && status !== "inactive") {
      throw new AppError(400, "Enter valid status");
    }
    if (!name || !location || capacity === undefined || capacity === null) {
      throw new AppError(400, "The information of Venue is not complete");
    }
    const updatedVenue = await modifyVenue(
      venueId,
      name,
      location,
      capacity,
      description,
      status,
    );
    res.status(200).json({
      message: "Venue updated successfully",
      data: updatedVenue,
    });
  },
);

export const modifyVenueStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    if (status !== "active" && status !== "inactive") {
      throw new AppError(400, "Enter valid status");
    }
    const venueId = Number(req.params.id);
    if (isNaN(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }
    const updatedVenue = await modifyVenueStatus(venueId, status);
    res.status(200).json({
      message: "Venue Status updated successfully",
      data: updatedVenue,
    });
  },
);
