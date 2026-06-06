-- Seed file for VendorBridge
-- WARNING: This will insert demo data. Do not run on production directly.

-- Insert Admin User (password is 'password' hashed with bcrypt)
-- Hashed 'password' = $2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@vendorbridge.com', '$2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2', 'ADMIN'),
('Procurement Manager', 'manager@vendorbridge.com', '$2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2', 'MANAGER'),
('John Officer', 'officer@vendorbridge.com', '$2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2', 'PROCUREMENT_OFFICER'),
('Tech Supply Co', 'vendor1@example.com', '$2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2', 'VENDOR'),
('Office Furnishings', 'vendor2@example.com', '$2b$10$bs.zE9KpSIrQ5Xt.ywCrwup28qRLYVVONWToCcpgQZ/F/miey2sH2', 'VENDOR');

-- Insert Vendors (assuming user IDs 4 and 5 correspond to vendors above)
-- Use a subquery to ensure correct user_id
INSERT INTO vendors (user_id, name, category, gst_number, email, phone, status, rating) 
SELECT id, name, 'IT Equipment', 'GST1234567890', email, '1234567890', 'ACTIVE', 4.5 
FROM users WHERE email = 'vendor1@example.com';

INSERT INTO vendors (user_id, name, category, gst_number, email, phone, status, rating) 
SELECT id, name, 'Furniture', 'GST0987654321', email, '0987654321', 'ACTIVE', 4.2 
FROM users WHERE email = 'vendor2@example.com';

-- Insert Sample RFQ
INSERT INTO rfqs (rfq_number, title, description, deadline, status, created_by) 
SELECT 'RFQ-2024-0001', 'Office Setup Phase 1', 'Looking for laptops and desks for the new office.', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN', id 
FROM users WHERE email = 'officer@vendorbridge.com';

-- Insert RFQ Items
INSERT INTO rfq_items (rfq_id, product_name, quantity, unit, specifications) 
SELECT id, 'Laptop i7 16GB RAM', 10, 'PCs', '14 inch screen, 512GB SSD' 
FROM rfqs WHERE rfq_number = 'RFQ-2024-0001';

INSERT INTO rfq_items (rfq_id, product_name, quantity, unit, specifications) 
SELECT id, 'Ergonomic Desk', 10, 'Units', 'Adjustable height' 
FROM rfqs WHERE rfq_number = 'RFQ-2024-0001';

-- Update counter
UPDATE counters SET value = 1 WHERE name = 'rfq';
