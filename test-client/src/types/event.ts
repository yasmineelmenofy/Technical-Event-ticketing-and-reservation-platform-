export type EventCategory =
  | "conference"
  | "workshop"
  | "technical_meetup"
  | "seminar"
  | "training_session";

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export type Event = {
  id: number;
  title: string;
  description: string | null;
  category: EventCategory;
  status: EventStatus;
  date: string;
  venue_id: number;
  start_time: string;
  end_time: string;
  image?: string | null;
};