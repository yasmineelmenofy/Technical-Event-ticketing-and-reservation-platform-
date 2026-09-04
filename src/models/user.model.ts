import pool from "../config/database.js";

export async function getAllUsers(
  filters: {
    role?: "customer" | "admin";
    name?: string;
    email?: string;
  } = {},
  sort: "id" | "name" | "email" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = ["id", "name", "email", "role"],
) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  const offset = (page - 1) * limit;

  if (filters.role !== undefined) {
    values.push(filters.role);
    conditions.push(`role = $${values.length}`);
  }

  if (filters.name !== undefined) {
    values.push(filters.name);
    conditions.push(`name = $${values.length}`);
  }

  if (filters.email !== undefined) {
    values.push(filters.email);
    conditions.push(`email = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortColumns = ["id", "name", "email"] as const;

  const sortColumn = allowedSortColumns.includes(sort) ? sort : "id";

  const sortOrder = order === "desc" ? "DESC" : "ASC";

  const allowedFields = ["id", "name", "email", "role"] as const;

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
    FROM users
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${limitPlaceholder}
    OFFSET $${offsetPlaceholder};
  `;

  const result = await pool.query(query, values);

  return result.rows;
}

export async function getUserById(userId: number) {
  const result = await pool.query("SELECT * FROM users WHERE id=$1", [userId]);
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const results = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return results.rows[0];
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  const results = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, passwordHash],
  );
  return results.rows[0];
}

export async function updateUser(userId: number, name: string, email: string) {
  const results = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, userId],
  );
  return results.rows[0];
}

export async function deleteUser(userId: number) {
  const results = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [userId],
  );
  return results.rows[0];
}
