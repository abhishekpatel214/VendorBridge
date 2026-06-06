-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','MANAGER','PROCUREMENT_OFFICER','VENDOR') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                          -- linked user account (nullable)
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  gst_number VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  country VARCHAR(100),
  status ENUM('ACTIVE','INACTIVE','PENDING') DEFAULT 'PENDING',
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- RFQs
CREATE TABLE IF NOT EXISTS rfqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfq_number VARCHAR(50) UNIQUE,        -- e.g. RFQ-2024-0001
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  status ENUM('DRAFT','OPEN','CLOSED','AWARDED') DEFAULT 'DRAFT',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rfq_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfq_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  specifications TEXT,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rfq_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfq_id INT NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

-- RFQ-Vendor Assignment (many-to-many)
CREATE TABLE IF NOT EXISTS rfq_vendors (
  rfq_id INT NOT NULL,
  vendor_id INT NOT NULL,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rfq_id, vendor_id),
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rfq_id INT NOT NULL,
  vendor_id INT NOT NULL,
  total_amount DECIMAL(15,2),
  delivery_days INT,
  notes TEXT,
  status ENUM('DRAFT','SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED') DEFAULT 'DRAFT',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  rfq_item_id INT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(15,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (rfq_item_id) REFERENCES rfq_items(id) ON DELETE CASCADE
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  approver_id INT NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  remarks TEXT,
  actioned_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE,         -- e.g. PO-2024-0001
  quotation_id INT NOT NULL,
  vendor_id INT NOT NULL,
  rfq_id INT NOT NULL,
  subtotal DECIMAL(15,2),
  tax_rate DECIMAL(5,2) DEFAULT 18.00,  -- GST %
  tax_amount DECIMAL(15,2),
  grand_total DECIMAL(15,2),
  status ENUM('DRAFT','CONFIRMED','INVOICED') DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,    -- e.g. INV-2024-0001
  purchase_order_id INT NOT NULL,
  issued_at DATE,
  due_date DATE,
  status ENUM('DRAFT','SENT','PAID') DEFAULT 'DRAFT',
  email_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,         -- e.g. 'RFQ_CREATED', 'QUOTATION_SUBMITTED'
  entity_type VARCHAR(50),              -- 'RFQ', 'QUOTATION', 'INVOICE', etc.
  entity_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Counters (for auto-numbering PO/RFQ/Invoice)
CREATE TABLE IF NOT EXISTS counters (
  name VARCHAR(50) PRIMARY KEY,
  value INT DEFAULT 0
);

INSERT IGNORE INTO counters (name, value) VALUES ('rfq',0),('po',0),('invoice',0);
