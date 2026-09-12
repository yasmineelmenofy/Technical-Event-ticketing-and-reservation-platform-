import pool from "../config/database.js";

export type TicketType = "regular" | "vip" | "student" | "early_bird";

export async function getTicketPrice(eventId: number, type: TicketType) {
  const result = await pool.query(
    `
      SELECT *
      FROM event_ticket_price
      WHERE event_id = $1
        AND type = $2;
    `,
    [eventId, type],
  );

  return result.rows[0];
}

export async function getTicketPricesByEvent(eventId: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM event_ticket_price
      WHERE event_id = $1
      ORDER BY type ASC;
    `,
    [eventId],
  );

  return result.rows;
}

export async function addTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const result = await pool.query(
    `
      INSERT INTO event_ticket_price (event_id, type, price)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
    [eventId, type, price],
  );

  return result.rows[0];
}

export async function updateTicketPrice(
  eventId: number,
  type: TicketType,
  price: number,
) {
  const result = await pool.query(
    `
      UPDATE event_ticket_price
      SET price = $1
      WHERE event_id = $2
        AND type = $3
      RETURNING *;
    `,
    [price, eventId, type],
  );

  return result.rows[0];
}

export async function deleteTicketPrice(eventId: number, type: TicketType) {
  const result = await pool.query(
    `
      DELETE FROM event_ticket_price
      WHERE event_id = $1
        AND type = $2
      RETURNING *;
    `,
    [eventId, type],
  );

  return result.rows[0];
}
