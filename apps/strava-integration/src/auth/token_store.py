import boto3
import time
from botocore.exceptions import ClientError
from config import DYNAMODB_ENDPOINT_URL, DYNAMODB_REGION, TOKENS_TABLE


def _table():
    kwargs = {"region_name": DYNAMODB_REGION}
    if DYNAMODB_ENDPOINT_URL:
        kwargs["endpoint_url"] = DYNAMODB_ENDPOINT_URL
    dynamodb = boto3.resource("dynamodb", **kwargs)
    return dynamodb.Table(TOKENS_TABLE)


def ensure_table_exists():
    kwargs = {"region_name": DYNAMODB_REGION}
    if DYNAMODB_ENDPOINT_URL:
        kwargs["endpoint_url"] = DYNAMODB_ENDPOINT_URL
    client = boto3.client("dynamodb", **kwargs)
    try:
        client.create_table(
            TableName=TOKENS_TABLE,
            KeySchema=[{"AttributeName": "participant_id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "participant_id", "AttributeType": "S"},
                {"AttributeName": "strava_athlete_id", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[{
                "IndexName": "strava_athlete_id-index",
                "KeySchema": [{"AttributeName": "strava_athlete_id", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            }],
            BillingMode="PAY_PER_REQUEST",
        )
        client.get_waiter("table_exists").wait(TableName=TOKENS_TABLE)
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceInUseException":
            raise


def save(participant_id: str, company_id: str, strava_athlete_id: str,
         access_token: str, refresh_token: str, expires_at: int):
    _table().put_item(Item={
        "participant_id": participant_id,
        "company_id": company_id,
        "strava_athlete_id": str(strava_athlete_id),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
    })


def get_by_participant(participant_id: str) -> dict | None:
    resp = _table().get_item(Key={"participant_id": participant_id})
    return resp.get("Item")


def get_by_athlete(strava_athlete_id: str) -> dict | None:
    resp = _table().query(
        IndexName="strava_athlete_id-index",
        KeyConditionExpression="strava_athlete_id = :aid",
        ExpressionAttributeValues={":aid": str(strava_athlete_id)},
    )
    items = resp.get("Items", [])
    return items[0] if items else None


def update_tokens(participant_id: str, access_token: str,
                  refresh_token: str, expires_at: int):
    _table().update_item(
        Key={"participant_id": participant_id},
        UpdateExpression="SET access_token = :a, refresh_token = :r, expires_at = :e",
        ExpressionAttributeValues={
            ":a": access_token,
            ":r": refresh_token,
            ":e": expires_at,
        },
    )
