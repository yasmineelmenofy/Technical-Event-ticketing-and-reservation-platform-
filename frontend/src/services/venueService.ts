import { apiFetch } from "../api/api";
import type { Venue, VenueStatus } from "../types/venue";

type VenuesResponse = {
  message: string;
  data: Venue[];
};

type VenueResponse = {
  message: string;
  data: Venue;
};

export async function getVenues() {
  const response = await apiFetch(
    "/api/venues?sort=name&order=asc&limit=100",
  );

  return (response as VenuesResponse).data;
}

export async function createVenue(data: {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  status: VenueStatus;
}) {
  const response = await apiFetch("/api/venues", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return (response as VenueResponse).data;
}

export async function updateVenue(
  venueId: number,
  data: {
    name: string;
    location: string;
    capacity: number;
    description?: string;
    status: VenueStatus;
  },
) {
  const response = await apiFetch(
    `/api/venues/${venueId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  return (response as VenueResponse).data;
}

export async function updateVenueStatus(
  venueId: number,
  status: VenueStatus,
) {
  const response = await apiFetch(
    `/api/venues/${venueId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return (response as VenueResponse).data;
}