import pool from "../config/database.js";
import { TicketType } from "./eventTicketPrice.model.js";

export async function addSeat(
  row: string,
  section: string,
  seat_number: number,
  venue_id: number,
  type: TicketType,
) {
  const result = await pool.query(
    `
      INSERT INTO seat (
        row,
        section,
        seat_number,
        venue_id,
        type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [row, section, seat_number, venue_id, type],
  );

  return result.rows[0];
}

export async function getSeatsByVenue(venue_id: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM seat
      WHERE venue_id = $1
      ORDER BY section ASC, row ASC, seat_number ASC;
    `,
    [venue_id],
  );

  return result.rows;
}

export async function getSeatById(seat_id: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM seat
      WHERE id = $1;
    `,
    [seat_id],
  );

  return result.rows[0];
}

export async function updateSeat(
  seat_id: number,
  row: string,
  section: string,
  seat_number: number,
  type: TicketType,
) {
  const result = await pool.query(
    `
      UPDATE seat
      SET row = $1,
          section = $2,
          seat_number = $3,
          type = $4
      WHERE id = $5
      RETURNING *;
    `,
    [row, section, seat_number, type, seat_id],
  );

  return result.rows[0];
}

export async function deleteSeat(seat_id: number) {
  const result = await pool.query(
    `
      DELETE FROM seat
      WHERE id = $1
      RETURNING *;
    `,
    [seat_id],
  );

  return result.rows[0];
}
