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

export const fetchAllVenuesController = asyncHandler(
  async (req: Request, res: Response) => {
    const venues = await fetchAllVenues();
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
