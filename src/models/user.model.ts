import pool from "../config/database.js";

export async function getAllUsers() {
  try {
    const results = await pool.query("SELECT * FROM users");
    return results.rows;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [
      userId,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Errory fetching user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const results = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return results.rows[0];
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  try {
    const results = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, passwordHash],
    );
    return results.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(userId: number, name: string, email: string) {
  try {
    const results = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, userId],
    );
    return results.rows[0];
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  try {
    const results = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId],
    );
    return results.rows[0];
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
