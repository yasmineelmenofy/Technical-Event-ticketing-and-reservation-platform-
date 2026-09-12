import pool from "../config/database.js";
import { TicketType } from "./eventTicketPrice.model.js";

export async function addTicket(
  type: TicketType,
  price: number,
  seatId: number,
  reservationId: number,
  eventId: number,
) {
  const result = await pool.query(
    `
      INSERT INTO ticket (
        type,
        price,
        seat_id,
        reservation_id,
        event_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [type, price, seatId, reservationId, eventId],
  );

  return result.rows[0];
}

export async function getTicketsByReservation(
  reservationId: number,
) {
  const result = await pool.query(
    `
      SELECT *
      FROM ticket
      WHERE reservation_id = $1
      ORDER BY id ASC;
    `,
    [reservationId],
  );

  return result.rows;
}

export async function getTicketById(ticketId: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM ticket
      WHERE id = $1;
    `,
    [ticketId],
  );

  return result.rows[0];
}

export async function getTicketsByUser(userId: number) {
  const result = await pool.query(
    `
      SELECT t.*
      FROM ticket t
      JOIN reservation r
        ON t.reservation_id = r.id
      WHERE r.user_id = $1
      ORDER BY t.id ASC;
    `,
    [userId],
  );

  return result.rows;
}

export async function deleteTicket(ticketId: number) {
  const result = await pool.query(
    `
      DELETE FROM ticket
      WHERE id = $1
      RETURNING *;
    `,
    [ticketId],
  );

  return result.rows[0];
}