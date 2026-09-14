export type VenueStatus = "active" | "inactive";

export type Venue = {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description: string | null;
  status: VenueStatus;
};