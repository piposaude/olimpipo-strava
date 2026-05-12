#!/bin/bash
# Creates a test activity on Strava using the stored token for a participant
# Usage: ./scripts/create_test_activity.sh <participant_id>

set -e

PARTICIPANT_ID="${1:?Usage: $0 <participant_id>}"
source .env

TOKEN=$(python3 -c "
import boto3
client = boto3.client('dynamodb',
    endpoint_url='${DYNAMODB_ENDPOINT_URL/dynamodb-local/localhost}',
    region_name='${DYNAMODB_REGION}',
    aws_access_key_id='${AWS_ACCESS_KEY_ID}',
    aws_secret_access_key='${AWS_SECRET_ACCESS_KEY}',
)
resp = client.get_item(TableName='strava-tokens', Key={'participant_id': {'S': '${PARTICIPANT_ID}'}})
print(resp['Item']['access_token']['S'])
")

echo "Creating test activity for participant: $PARTICIPANT_ID"

curl -s -X POST https://www.strava.com/api/v3/activities \
  -H "Authorization: Bearer $TOKEN" \
  -d "name=Treino Olimpipo" \
  -d "sport_type=Run" \
  -d "start_date_local=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -d "elapsed_time=1800" \
  -d "distance=5000" | python3 -m json.tool
