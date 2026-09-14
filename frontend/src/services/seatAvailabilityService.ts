import { apiFetch } from "../api/api";
import type { Seat } from "../types/seat";

type AvailableSeatsResponse = {
  message: string;
  data: Seat[];
};

export async function getAvailableSeatsByEvent(
  eventId: number,
) {
  const response = await apiFetch(
    `/api/seat-holds/event/${eventId}/available-seats`,
  );

  return (response as AvailableSeatsResponse).data;
}