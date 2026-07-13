import psycopg2

# TODO: Paste your actual Neon DB URL inside the quotes below!
DB_URL = "DATABASE_URL"
print("Connecting to Neon Database...")

try:
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # This command creates the complete, perfect table from scratch!
    setup_query = """
    CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        crime_type VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        crime_date VARCHAR(255) DEFAULT '2026-07-12T12:00'
    );
    """
    
    cursor.execute(setup_query)
    conn.commit()
    
    print("✅ SUCCESS: The complete 'incidents' table has been created!")
except Exception as e:
    print(f"❌ ERROR: {e}")
finally:
    if 'conn' in locals():
        conn.close()