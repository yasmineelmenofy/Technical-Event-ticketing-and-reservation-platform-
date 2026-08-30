import pool from "../config/database.js";



export async function getAllEvents() {
    const results = await pool.query("SELECT * FROM event ORDER BY id ASC");
    return results.rows;
}

export async function getEventById(evnetId:number) {
    const result = await pool.query("SELECT * FROM event WHERE id=$1", [evnetId]);
    return result.rows[0];
}


export async function addEvent() {
   const result = await pool.query("INSERT INTO event(title,description,category,)")
}