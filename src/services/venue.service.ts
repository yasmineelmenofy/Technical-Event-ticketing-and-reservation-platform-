import {
  getAllVenues,
  getVenueById,
  addVenue,
  updateVenue,
  updateVenueStatus,
  Status,
} from "../models/venue.model.js";
import { AppError } from "../utils/AppError.js";

export async function fetchAllVenues() {
  const venues = await getAllVenues();
  return venues;
}

export async function fetchVenueById(venueId: number) {
  const venue = await getVenueById(venueId);
  if (!venue) {
    throw new AppError(404, "venue not found");
  }
  return venue;
}

export async function createVenue(
  name: string,
  location: string,
  capacity: number,
  description: string,
  status: Status,
) {
  const venue = await addVenue(
    name,
    location,
    capacity,
    description,
    status,
  );
  return venue;
}

export async function modifyVenue(
  venueId: number,
  name: string,
  location: string,
  capacity: number,
  description: string,
  status: Status,
) {
  const existingVenue = await getVenueById(venueId);
  if (!existingVenue) {
    throw new AppError(404, "Venue not found");
  }
  const updatedVenue = await updateVenue(
    venueId,
    name,
    location,
    capacity,
    description,
    status,
  );
  return updatedVenue;
}

export async function modifyVenueStatus(venueId: number, status: Status) {
  const existingVenue = await getVenueById(venueId);
  if (!existingVenue) {
    throw new AppError(404, "Venue not found");
  }
  const updatedVenue = await updateVenueStatus(venueId, status);
  return updatedVenue;
}
