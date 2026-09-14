import { PoolClient } from "pg";
import pool from "../config/database.js";

export type PaymentStatus = "accepted" | "rejected";

export async function addPayment(
  reservationId: number,
  transactionId: string,
  amount: number,
  status: PaymentStatus,
  client?: PoolClient,
) {
  const db = client ?? pool;

  const result = await db.query(
    `
      INSERT INTO payment (
        reservation_id,
        transaction_id,
        amount,
        status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [reservationId, transactionId, amount, status],
  );

  return result.rows[0];
}

export async function getPaymentById(paymentId: number) {
  const result = await pool.query(
    `
      SELECT *
      FROM payment
      WHERE id = $1;
    `,
    [paymentId],
  );

  return result.rows[0];
}

export async function getPaymentByReservation(
  reservationId: number,
  client?: PoolClient,
) {
  const db = client ?? pool;

  const result = await db.query(
    `
      SELECT *
      FROM payment
      WHERE reservation_id = $1;
    `,
    [reservationId],
  );

  return result.rows[0];
}
export async function updatePaymentStatus(
  paymentId: number,
  status: PaymentStatus,
) {
  const result = await pool.query(
    `
      UPDATE payment
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `,
    [status, paymentId],
  );

  return result.rows[0];
}
