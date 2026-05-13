import os
from dotenv import load_dotenv

load_dotenv()

STRAVA_INTEGRATION_PUBLIC_URL = os.getenv("STRAVA_INTEGRATION_PUBLIC_URL", "http://localhost:8000")
COMPANY_ID = os.getenv("COMPANY_ID", "pipo-hackathon")
