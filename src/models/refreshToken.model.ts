import pool from "../config/database.js";

export async function createRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
) {
  const result = await pool.query(
    `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [userId, tokenHash, expiresAt],
  );

  return result.rows[0];
}

export async function findRefreshToken(tokenHash: string) {
  const result = await pool.query(
    `
    SELECT *
    FROM refresh_tokens
    WHERE token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW();
    `,
    [tokenHash],
  );

  return result.rows[0];
}

export async function revokeRefreshToken(tokenHash: string) {
  const result = await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
      AND revoked_at IS NULL
    RETURNING *;
    `,
    [tokenHash],
  );

  return result.rows[0];
}
