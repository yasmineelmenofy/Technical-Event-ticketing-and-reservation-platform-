import { apiFetch } from "../api/api";
import type {
  Event,
  EventCategory,
  EventStatus,
} from "../types/event";

type EventsResponse = {
  message: string;
  data: Event[];
};

type EventResponse = {
  message: string;
  data: Event;
};

export async function getPublishedEvents() {
  const response = await apiFetch(
    "/api/events?status=published&sort=date&order=asc&limit=100",
  );

  return (response as EventsResponse).data;
}

export async function getAllEvents() {
  const response = await apiFetch(
    "/api/events?sort=date&order=asc&limit=100",
  );

  return (response as EventsResponse).data;
}

export async function getEventById(eventId: number) {
  const response = await apiFetch(
    `/api/events/${eventId}`,
  );

  return (response as EventResponse).data;
}

export async function createEvent(data: {
  title: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;
  date: string;
  venue_id: number;
  start_time: string;
  end_time: string;
  image?: string;
}) {
  const response = await apiFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return (response as EventResponse).data;
}

export async function updateEvent(
  eventId: number,
  data: {
    title: string;
    description?: string;
    category: EventCategory;
    status: EventStatus;
    date: string;
    venue_id: number;
    start_time: string;
    end_time: string;
    image?: string;
  },
) {
  const response = await apiFetch(
    `/api/events/${eventId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  return (response as EventResponse).data;
}

export async function updateEventStatus(
  eventId: number,
  status: EventStatus,
) {
  const response = await apiFetch(
    `/api/events/${eventId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  return (response as EventResponse).data;
}