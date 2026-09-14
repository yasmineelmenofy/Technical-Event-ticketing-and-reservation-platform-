import { PoolClient } from "pg";
import pool from "../config/database.js";
import { TicketType } from "./eventTicketPrice.model.js";

export async function addSeatHold(
  seatId: number,
  eventId: number,
  reservationId: number,
  type: TicketType,
  expiresAt: Date,
  client?: PoolClient,
) {
  const db = client ?? pool;

  const result = await db.query(
    `
      INSERT INTO seat_hold (
        seat_id,
        event_id,
        reservation_id,
        type,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (event_id, seat_id)
      DO UPDATE
      SET reservation_id = EXCLUDED.reservation_id,
          type = EXCLUDED.type,
          expires_at = EXCLUDED.expires_at
      WHERE seat_hold.expires_at <= CURRENT_TIMESTAMP
      RETURNING *;
    `,
    [seatId, eventId, reservationId, type, expiresAt],
  );

  return result.rows[0];
}
export async function getSeatHoldById(seatHoldId: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM seat_hold
      WHERE id = $1;
    `,
    [seatHoldId],
  );

  return result.rows[0];
}

export async function getSeatHoldsByReservation(
  reservationId: number,
  client?: PoolClient,
) {
  const db = client ?? pool;

  const result = await db.query(
    `
      SELECT *
      FROM seat_hold
      WHERE reservation_id = $1
      ORDER BY id ASC;
    `,
    [reservationId],
  );

  return result.rows;
}

export async function getSeatHoldByEventAndSeat(
  eventId: number,
  seatId: number,
) {
  const result = await pool.query(
    `
      SELECT *
      FROM seat_hold
      WHERE event_id = $1
        AND seat_id = $2;
    `,
    [eventId, seatId],
  );

  return result.rows[0];
}

export async function deleteSeatHold(seatHoldId: number, client?: PoolClient) {
  const db = client ?? pool;

  const result = await db.query(
    `
      DELETE FROM seat_hold
      WHERE id = $1
      RETURNING *;
    `,
    [seatHoldId],
  );

  return result.rows[0];
}

export async function getAvailableSeatsByEvent(eventId: number) {
  const result = await pool.query(
    `
      SELECT s.*
      FROM seat s
      JOIN event e
        ON e.venue_id = s.venue_id
      WHERE e.id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM ticket t
          WHERE t.event_id = $1
            AND t.seat_id = s.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM seat_hold sh
          WHERE sh.event_id = $1
            AND sh.seat_id = s.id
            AND sh.expires_at > CURRENT_TIMESTAMP
        )
      ORDER BY s.section ASC, s.row ASC, s.seat_number ASC;
    `,
    [eventId],
  );

  return result.rows;
}
