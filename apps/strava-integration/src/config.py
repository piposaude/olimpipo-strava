import os
from dotenv import load_dotenv

load_dotenv()

STRAVA_CLIENT_ID = os.environ["STRAVA_CLIENT_ID"]
STRAVA_CLIENT_SECRET = os.environ["STRAVA_CLIENT_SECRET"]
STRAVA_VERIFY_TOKEN = os.environ["STRAVA_VERIFY_TOKEN"]
STRAVA_REDIRECT_URI = os.environ["STRAVA_REDIRECT_URI"]
STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_API_BASE = "https://www.strava.com/api/v3"

JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
JWT_ALGORITHM = "HS256"
STATE_TTL_SECONDS = 600  # 10 minutes

HEALTH_ACTIONS_BASE_URL = os.environ["HEALTH_ACTIONS_BASE_URL"]
COMPANY_ID = os.environ["COMPANY_ID"]

DYNAMODB_ENDPOINT_URL = os.getenv("DYNAMODB_ENDPOINT_URL")
DYNAMODB_REGION = os.getenv("DYNAMODB_REGION", "us-east-1")
TOKENS_TABLE = "strava-tokens"

MIN_ACTIVITY_DURATION_SECONDS = int(os.getenv("MIN_ACTIVITY_DURATION_SECONDS", "1200"))

ELIGIBLE_ACTIVITY_TYPES = {
    "Run", "Walk", "Ride", "Workout", "WeightTraining",
    "Swim", "Yoga", "Hike", "Elliptical", "StairStepper",
}
