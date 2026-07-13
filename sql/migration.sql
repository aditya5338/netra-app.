-- NETRA Data Layer Migration
-- Create tables
CREATE TABLE IF NOT EXISTS offenders (
    id SERIAL PRIMARY KEY,
    name TEXT,
    aliases TEXT[],
    mo_tags TEXT[]
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    district TEXT,
    crime_type TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    offender_id INT REFERENCES offenders(id),
    incident_id INT REFERENCES incidents(id),
    phone_number TEXT,
    vehicle_number TEXT
);

-- Populate with synthetic data
INSERT INTO offenders (name, aliases, mo_tags) VALUES
    ('John Doe', ARRAY['JD', 'The Ghost'], ARRAY['breaking and entering', 'nighttime']),
    ('Jane Smith', ARRAY['JS', 'Shadow'], ARRAY['fraud', 'cybercrime']),
    ('Bob Johnson', ARRAY['BJ', 'Flash'], ARRAY['theft', 'quick getaway']);

INSERT INTO incidents (timestamp, lat, lng, district, crime_type, status) VALUES
    (NOW() - INTERVAL '2 hours', 51.5074, -0.1278, 'District X', 'Cybercrime', 'open'),
    (NOW() - INTERVAL '1 hour', 51.5084, -0.1288, 'District Y', 'Theft', 'under investigation'),
    (NOW() - INTERVAL '30 minutes', 51.5094, -0.1298, 'District Z', 'Fraud', 'closed');

INSERT INTO connections (offender_id, incident_id, phone_number, vehicle_number) VALUES
    (2, 1, '555-1234', NULL),
    (3, 2, '555-5678', 'AB12 CDE'),
    (1, 3, NULL, NULL);
