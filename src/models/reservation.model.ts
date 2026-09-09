import pool from "../config/database.js";

export async function addReservation(userId: number, eventId: number) {
  const result = await pool.query(
    `
      INSERT INTO reservation (user_id, event_id)
      VALUES ($1, $2)
      RETURNING *;
    `,
    [userId, eventId],
  );

  return result.rows[0];
}

export async function getReservationsByUser(
  userId: number,
  filters: {
    status?: "pending" | "confirmed" | "cancelled";
    event_id?: number;
  } = {},
  sort: "id" | "created_at" | "status" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = ["id", "user_id", "event_id", "created_at", "status"],
) {
  const conditions: string[] = [`user_id = $1`];
  const values: (string | number)[] = [userId];

  if (filters.status !== undefined) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.event_id !== undefined) {
    values.push(filters.event_id);
    conditions.push(`event_id = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const allowedSortColumns = ["id", "created_at", "status"] as const;

  const sortColumn = allowedSortColumns.includes(sort) ? sort : "id";

  const sortOrder = order === "desc" ? "DESC" : "ASC";

  const allowedFields = [
    "id",
    "user_id",
    "event_id",
    "created_at",
    "status",
  ] as const;

  const selectedFields = fields.filter((field) =>
    allowedFields.includes(field as (typeof allowedFields)[number]),
  );

  const selectClause =
    selectedFields.length > 0
      ? selectedFields.join(", ")
      : allowedFields.join(", ");

  const offset = (page - 1) * limit;

  values.push(limit);
  const limitPlaceholder = values.length;

  values.push(offset);
  const offsetPlaceholder = values.length;

  const query = `
    SELECT ${selectClause}
    FROM reservation
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${limitPlaceholder}
    OFFSET $${offsetPlaceholder};
  `;

  const results = await pool.query(query, values);

  return results.rows;
}

export async function getAllReservations(
  filters: {
    status?: "pending" | "confirmed" | "cancelled";
    event_id?: number;
  } = {},
  sort: "id" | "created_at" | "status" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = ["id", "user_id", "event_id", "created_at", "status"],
) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.status !== undefined) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.event_id !== undefined) {
    values.push(filters.event_id);
    conditions.push(`event_id = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortColumns = ["id", "created_at", "status"] as const;

  const sortColumn = allowedSortColumns.includes(sort) ? sort : "id";

  const sortOrder = order === "desc" ? "DESC" : "ASC";

  const allowedFields = [
    "id",
    "user_id",
    "event_id",
    "created_at",
    "status",
  ] as const;

  const selectedFields = fields.filter((field) =>
    allowedFields.includes(field as (typeof allowedFields)[number]),
  );

  const selectClause =
    selectedFields.length > 0
      ? selectedFields.join(", ")
      : allowedFields.join(", ");

  const offset = (page - 1) * limit;

  values.push(limit);
  const limitPlaceholder = values.length;

  values.push(offset);
  const offsetPlaceholder = values.length;

  const query = `
    SELECT ${selectClause}
    FROM reservation
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${limitPlaceholder}
    OFFSET $${offsetPlaceholder};
  `;

  const results = await pool.query(query, values);

  return results.rows;
}

export async function getReservationById(reservationId: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM reservation
      WHERE id = $1;
    `,
    [reservationId],
  );

  return result.rows[0];
}

export async function updateReservationStatus(
  reservationId: number,
  status: "pending" | "confirmed" | "cancelled",
) {
  const result = await pool.query(
    `
      UPDATE reservation
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `,
    [status, reservationId],
  );

  return result.rows[0];
}