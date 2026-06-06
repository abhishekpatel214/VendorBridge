import pool from "./lib/db";

async function main() {
  try {
    const [rows] = await pool.query("DESCRIBE quotation_items");
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
main();
