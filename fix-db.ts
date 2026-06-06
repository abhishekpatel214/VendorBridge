import pool from "./lib/db";

async function main() {
  try {
    await pool.query("ALTER TABLE activity_logs ADD COLUMN details TEXT NULL");
    console.log("Column 'details' added successfully.");
  } catch (err: any) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column 'details' already exists.");
    } else {
      console.error("Error adding column:", err);
    }
  } finally {
    process.exit(0);
  }
}
main();
