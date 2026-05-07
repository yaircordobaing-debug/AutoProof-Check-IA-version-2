CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50),
    phone VARCHAR(20),
    driver_license VARCHAR(100),
    license_category VARCHAR(10),
    license_status VARCHAR(50),
    license_expiry DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- VEHICLES
-- =========================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) UNIQUE NOT NULL,
    internal_number VARCHAR(50),
    type VARCHAR(50),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    current_km INT DEFAULT 0,
    oil_change_km INT,
    next_oil_change_km INT,
    status VARCHAR(50) DEFAULT 'Activo',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- VEHICLE DOCUMENTS
-- =========================================

CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    file_url TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DOCUMENT ALERTS
-- =========================================

CREATE TABLE document_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES vehicle_documents(id) ON DELETE CASCADE,
    alert_type VARCHAR(100),
    message TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TRIPS
-- =========================================

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    start_time TIMESTAMP,
    expected_end_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    start_km INT,
    end_km INT,
    total_km INT,
    trip_status VARCHAR(50),
    vehicle_rating INT,
    review_notes TEXT,
    pre_trip_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TRIP STATUS HISTORY
-- =========================================

CREATE TABLE trip_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INSPECTIONS
-- =========================================

CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    inspection_type VARCHAR(50),
    score INT,
    status VARCHAR(50),
    blocked_trip BOOLEAN DEFAULT FALSE,
    pdf_report_url TEXT,
    hash_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INSPECTION ITEMS
-- =========================================

CREATE TABLE inspection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    component_name VARCHAR(255),
    component_category VARCHAR(100),
    status VARCHAR(50),
    validation_method VARCHAR(50),
    observation TEXT,
    ai_response TEXT,
    detected_values TEXT,
    image_url TEXT,
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- AI ANALYSIS LOGS
-- =========================================

CREATE TABLE ai_analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    ai_model VARCHAR(100),
    prompt TEXT,
    response TEXT,
    confidence_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ACCIDENTS
-- =========================================

CREATE TABLE accidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    trip_id UUID REFERENCES trips(id),
    accident_date TIMESTAMP,
    location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    severity VARCHAR(50),
    status VARCHAR(50),
    description TEXT,
    pdf_report_url TEXT,
    hash_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ACCIDENT EVIDENCES
-- =========================================

CREATE TABLE accident_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accident_id UUID REFERENCES accidents(id) ON DELETE CASCADE,
    evidence_category VARCHAR(100),
    file_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ACCIDENT WITNESSES
-- =========================================

CREATE TABLE accident_witnesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accident_id UUID REFERENCES accidents(id) ON DELETE CASCADE,
    name VARCHAR(255),
    phone VARCHAR(50),
    statement TEXT,
    audio_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- MAINTENANCE RECORDS
-- =========================================

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100),
    km INT,
    cost DECIMAL(12,2),
    description TEXT,
    performed_by VARCHAR(255),
    maintenance_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- VEHICLE IMAGES
-- =========================================

CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    image_type VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);