import pool from "./lib/db";

async function main() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS po_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_id INT NOT NULL,
        rfq_item_id INT NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createTableQuery);
    console.log("Table 'po_items' created successfully.");
  } catch (err: any) {
    console.error("Error creating table:", err);
  } finally {
    process.exit(0);
  }
}
main();
