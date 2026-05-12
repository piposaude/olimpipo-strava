#!/bin/bash
# Usage: ./scripts/register_webhook.sh https://<ngrok-id>.ngrok.io

set -e

CALLBACK_URL="${1:?Usage: $0 <callback_url>}"
source .env

echo "Registering webhook subscription..."
echo "Callback URL: $CALLBACK_URL/webhook"

curl -s -X POST https://www.strava.com/api/v3/push_subscriptions \
  -d "client_id=${STRAVA_CLIENT_ID}" \
  -d "client_secret=${STRAVA_CLIENT_SECRET}" \
  -d "callback_url=${CALLBACK_URL}/webhook" \
  -d "verify_token=${STRAVA_VERIFY_TOKEN}" | python3 -m json.tool

echo ""
echo "To check existing subscriptions:"
echo "  curl -G https://www.strava.com/api/v3/push_subscriptions \\"
echo "    -d client_id=${STRAVA_CLIENT_ID} \\"
echo "    -d client_secret=${STRAVA_CLIENT_SECRET}"
