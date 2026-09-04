import pool from "../config/database.js";

export type Status = "active" | "inactive";

export async function getAllVenues(
  filters: {
    status?: Status;
    location?: string;
    min_capacity?: number;
    max_capacity?: number;
  } = {},
  sort: "id" | "name" | "capacity" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = [
    "id",
    "name",
    "location",
    "capacity",
    "description",
    "status",
  ],
) {
  const conditions: string[] = [];
  const values: (Status | string | number)[] = [];

  const offset = (page - 1) * limit;

  if (filters.status !== undefined) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.location !== undefined) {
    values.push(filters.location);
    conditions.push(`location = $${values.length}`);
  }

  if (filters.min_capacity !== undefined) {
    values.push(filters.min_capacity);
    conditions.push(`capacity >= $${values.length}`);
  }

  if (filters.max_capacity !== undefined) {
    values.push(filters.max_capacity);
    conditions.push(`capacity <= $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortColumns = ["id", "name", "capacity"] as const;

  const sortColumn = allowedSortColumns.includes(sort) ? sort : "id";

  const sortOrder = order === "desc" ? "DESC" : "ASC";

  const allowedFields = [
    "id",
    "name",
    "location",
    "capacity",
    "description",
    "status",
  ] as const;

  const selectedFields = fields.filter((field) =>
    allowedFields.includes(field as (typeof allowedFields)[number]),
  );

  const selectClause =
    selectedFields.length > 0
      ? selectedFields.join(", ")
      : allowedFields.join(", ");

  values.push(limit);
  const limitPlaceholder = values.length;

  values.push(offset);
  const offsetPlaceholder = values.length;

  const query = `
    SELECT ${selectClause}
    FROM venue
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${limitPlaceholder}
    OFFSET $${offsetPlaceholder};
  `;

  const result = await pool.query(query, values);

  return result.rows;
}
export async function getVenueById(venueId: number) {
  const result = await pool.query("SELECT * FROM venue WHERE id=$1", [venueId]);
  return result.rows[0];
}

export async function addVenue(
  name: string,
  location: string,
  capacity: number,
  description: string | undefined,
  status: Status,
) {
  const results = await pool.query(
    "INSERT INTO venue(name, location, capacity, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [name, location, capacity, description ?? null, status],
  );
  return results.rows[0];
}

export async function updateVenue(
  venueId: number,
  name: string,
  location: string,
  capacity: number,
  description: string | undefined,
  status: Status,
) {
  const results = await pool.query(
    "UPDATE venue SET name = $1, location = $2, capacity = $3, description = $4, status = $5 WHERE id = $6 RETURNING *;",
    [name, location, capacity, description ?? null, status, venueId],
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
