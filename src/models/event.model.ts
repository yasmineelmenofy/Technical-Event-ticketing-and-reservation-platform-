import pool from "../config/database.js";
export type Category =
  | "conference"
  | "workshop"
  | "technical_meetup"
  | "seminar"
  | "training_session";

export type Status = "draft" | "published" | "cancelled" | "completed";
export async function getAllEvents(
  filters: {
    status?: Status;
    category?: Category;
    venue_id?: number;
  } = {},
  sort: "id" | "title" | "date" = "id",
  order: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10,
  fields: string[] = [
    "id",
    "title",
    "description",
    "category",
    "status",
    "date",
    "venue_id",
    "start_time",
    "end_time",
    "image",
  ],
) {
  const conditions: string[] = [];
  const values: (Status | Category | number)[] = [];
  const offset = (page - 1) * limit;
  const allowedFields = [
    "id",
    "title",
    "description",
    "category",
    "status",
    "date",
    "venue_id",
    "start_time",
    "end_time",
    "image",
  ] as const;
  if (filters.status !== undefined) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.category !== undefined) {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }

  if (filters.venue_id !== undefined) {
    values.push(filters.venue_id);
    conditions.push(`venue_id = $${values.length}`);
  }
  values.push(limit);
  const limitPlaceholder = values.length;

  values.push(offset);
  const offsetPlaceholder = values.length;
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortColumns = ["id", "title", "date"] as const;
  const sortColumn = allowedSortColumns.includes(sort) ? sort : "id";

  const sortOrder = order === "desc" ? "DESC" : "ASC";
  const selectedFields = fields.filter((field) =>
    allowedFields.includes(field as (typeof allowedFields)[number]),
  );

  const selectClause =
    selectedFields.length > 0
      ? selectedFields.join(", ")
      : allowedFields.join(", ");
  const query = `SELECT ${selectClause} FROM event ${whereClause}
  ORDER BY ${sortColumn} ${sortOrder}
  LIMIT $${limitPlaceholder} OFFSET $${offsetPlaceholder};`;
  const result = await pool.query(query, values);
  return result.rows;
}

export async function getEventById(eventId: number) {
  const result = await pool.query("SELECT * FROM event WHERE id=$1", [eventId]);
  return result.rows[0];
}

export async function addEvent(
  title: string,
  description: string | undefined,
  category: Category,
  status: Status,
  date: Date,
  venue_id: number,
  start_time: string,
  end_time: string,
  image: string | undefined,
) {
  const result = await pool.query(
    "INSERT INTO event(title,description,category,status,date,venue_id,start_time,end_time,image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;",
    [
      title,
      description ?? null,
      category,
      status,
      date,
      venue_id,
      start_time,
      end_time,
      image ?? null,
    ],
  );
  return result.rows[0];
}

export async function updateEvent(
  eventId: number,
  title: string,
  description: string | undefined,
  category: Category,
  status: Status,
  date: Date,
  venue_id: number,
  start_time: string,
  end_time: string,
  image: string | undefined,
) {
  const result = await pool.query(
    "UPDATE event SET title=$1 , description=$2 , category=$3 , status=$4 , date=$5 , venue_id=$6 ,start_time=$7 , end_time=$8 , image=$9 WHERE id=$10 RETURNING *;",
    [
      title,
      description ?? null,
      category,
      status,
      date,
      venue_id,
      start_time,
      end_time,
      image ?? null,
      eventId,
    ],
  );
  return result.rows[0];
}

export async function updateEventStatus(eventId: number, status: Status) {
  const result = await pool.query(
    "UPDATE event SET  status=$1 WHERE id=$2  RETURNING *;",
    [status, eventId],
  );
  return result.rows[0];
}
