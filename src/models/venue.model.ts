import pool from "../config/database.js";

export type Status = "active" | "inactive";

export async function getAllVenues() {
  const results = await pool.query("SELECT * FROM venue ORDER BY id ASC");
  return results.rows;
}

export async function getVenueById(venueId: number) {
  const result = await pool.query("SELECT * FROM venue WHERE id=$1", [venueId]);
  return result.rows[0];
}

export async function addVenue(
  name: string,
  location: string,
  capacity: number,
  description: string,
  status: Status,
) {
  const results = await pool.query(
    "INSERT INTO venue(name, location, capacity, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [name, location, capacity, description, status],
  );
  return results.rows[0];
}

export async function updateVenue(
  venueId: number,
  name: string,
  location: string,
  capacity: number,
  description: string,
  status: Status,
) {
  const results = await pool.query(
    "UPDATE venue SET name = $1, location = $2, capacity = $3, description = $4, status = $5 WHERE id = $6 RETURNING *;",
    [name, location, capacity, description, status, venueId],
  );
  return results.rows[0];
}
export async function updateVenueStatus(venueId: number, status: Status) {
  const results = await pool.query(
    "UPDATE venue SET status = $1 WHERE id = $2 RETURNING *;",
    [status, venueId],
  );

  return results.rows[0];
}
