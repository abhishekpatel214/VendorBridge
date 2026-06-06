import pool from "./lib/db";

async function main() {
  try {
    await pool.query("ALTER TABLE quotation_items ADD COLUMN remarks TEXT NULL");
    console.log("Column 'remarks' added to quotation_items successfully.");
  } catch (err: any) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column 'remarks' already exists in quotation_items.");
    } else {
      console.error("Error adding column:", err);
    }
  } finally {
    process.exit(0);
  }
}
main();
