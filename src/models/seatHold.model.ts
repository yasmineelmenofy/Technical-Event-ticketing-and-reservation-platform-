import pool from "../config/database.js";

export async function addSeatHold(
  seatId: number,
  eventId: number,
  reservationId: number,
  expiresAt: Date,
) {
  const result = await pool.query(
    `
      INSERT INTO seat_hold (
        seat_id,
        event_id,
        reservation_id,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [seatId, eventId, reservationId, expiresAt],
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

export async function getSeatHoldsByReservation(reservationId: number) {
  const result = await pool.query(
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

export async function deleteSeatHold(seatHoldId: number) {
  const result = await pool.query(
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
