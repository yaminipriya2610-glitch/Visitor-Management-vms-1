-- Reference schema for learning. The FastAPI app creates these tables
-- automatically from SQLAlchemy models at startup after DATABASE_URL is configured.
-- Run this file only if you want to create the tables manually instead.
-- Do not run both approaches against a fresh database unless you understand migrations.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS visitor_bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    visitor_name VARCHAR(120) NOT NULL,
    visitor_contact VARCHAR(30) NOT NULL,
    id_proof_type VARCHAR(50) NOT NULL,
    id_proof_number VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    visit_date VARCHAR(10) NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    qr_token VARCHAR(80) UNIQUE,
    qr_data TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_visitor_bookings_id ON visitor_bookings (id);
CREATE INDEX IF NOT EXISTS ix_visitor_bookings_booking_code ON visitor_bookings (booking_code);
