from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
import google.generativeai as genai
import json
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: PASTE YOUR NEON DB URL HERE
DB_URL = "DATABASE_URL"

# TODO: PASTE YOUR GOOGLE API KEY HERE
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) 
model = genai.GenerativeModel('gemini-1.5-flash')
# --- THE PERFECTLY SYNCED DATA MODEL ---
class NewIncident(BaseModel):
    crime_type: str
    district: str
    lat: float
    lng: float
    crime_date: str

@app.post("/api/incidents")
def create_incident(incident: NewIncident):
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        # Insert all 5 fields into the database
        cursor.execute(
            "INSERT INTO incidents (crime_type, district, lat, lng, crime_date) VALUES (%s, %s, %s, %s, %s);",
            (incident.crime_type, incident.district, incident.lat, incident.lng, incident.crime_date)
        )
        conn.commit() 
        conn.close()
        return {"status": "success", "message": "Threat recorded securely."}
    except Exception as e:
        print(f"Failed to insert: {e}")
        # Send a 500 error back to React if the database rejects it
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/incidents")
def get_incidents():
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, lat, lng, crime_type, district, crime_date FROM incidents;")
        data = cursor.fetchall()
        conn.close()
        return data
    except Exception as e:
        print(f"Database error: {e}")
        return []

@app.get("/api/stats")
def get_stats():
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT crime_type, district FROM incidents LIMIT 10;")
        recent_crimes = cursor.fetchall()
        conn.close()

        # Only ask the AI to analyze if there are actually crimes in the DB
        if not recent_crimes:
            return {
                "anomaly": "Awaiting Initial Intel.",
                "correlation": "System standing by.",
                "syndicates": "No active threats."
            }

        prompt = f"""
        You are a top-tier law enforcement AI analyst. 
        Analyze these recent incidents: {recent_crimes}
        
        Provide a brief, professional threat assessment. 
        You MUST respond with ONLY a raw JSON object matching this exact format, with no markdown formatting or extra text:
        {{
            "anomaly": "1 sentence about any weird patterns",
            "correlation": "1 sentence about location/crime links",
            "syndicates": "1 short alert about potential organized activity"
        }}
        """

        response = model.generate_content(prompt)
        ai_data = json.loads(response.text)
        return ai_data

    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "anomaly": "AI Offline - Using standard deviation.",
            "correlation": "Unable to compute correlation.",
            "syndicates": "Tracking paused."
        }

@app.get("/api/network")
def get_network_data():
    return {
        "nodes": [
            {"id": "INC-001", "name": "Cyber Heist", "group": 1, "val": 20},
            {"id": "SUS-A", "name": "Unknown IP (VPN)", "group": 2, "val": 10},
            {"id": "SUS-B", "name": "Alias 'Ghost'", "group": 2, "val": 10},
            {"id": "LOC-1", "name": "Koramangala Server", "group": 3, "val": 15},
            {"id": "ACC-1", "name": "Offshore Crypto Wallet", "group": 4, "val": 10}
        ],
        "links": [
            {"source": "INC-001", "target": "SUS-A"},
            {"source": "INC-001", "target": "LOC-1"},
            {"source": "SUS-A", "target": "SUS-B"},
            {"source": "SUS-B", "target": "ACC-1"},
            {"source": "LOC-1", "target": "ACC-1"}
        ]
    }
