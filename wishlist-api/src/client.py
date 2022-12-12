import boto3
import config
import uuid
import hashlib
from error import AccessDeniedException

dynamo_client = boto3.client("dynamodb")


def _map_list(item: dict):
    return {
        "id": item["sk"]["S"].split("_")[1],
        "name": item["name"]["S"],
        "owner": item["pk"]["S"],
    }


def _map_item(item: dict):
    return {
        "id": item["sk"]["S"].split("_")[1],
        "description": item["description"]["S"],
        "url": item["url"]["S"] if "url" in item else None,
        "price": item["price"]["S"] if "price" in item else None,
    }


def get_lists(owner: str):
    response = dynamo_client.query(
        TableName=config.dynamodb_table,
        KeyConditionExpression="pk = :owner AND begins_with(sk, :prefix)",
        ExpressionAttributeValues={
            ":owner": {
                "S": owner,
            },
            ":prefix": {
                "S": "wishlist_",
            },
        },
    )

    return [_map_list(item) for item in response["Items"]]


def create_list(owner: str, name: str):
    id = hashlib.md5(uuid.uuid4().hex.encode("utf-8")).hexdigest()

    dynamo_client.put_item(
        TableName=config.dynamodb_table,
        Item={
            "pk": {
                "S": owner,
            },
            "sk": {
                "S": f"wishlist_{id}",
            },
            "name": {
                "S": name,
            },
        },
    )

    return {"id": id, "name": name, "owner": owner}


def get_list(id: str):
    response = dynamo_client.query(
        TableName=config.dynamodb_table,
        IndexName="wishlist_id",
        KeyConditionExpression="sk = :prefix",
        ExpressionAttributeValues={
            ":prefix": {
                "S": f"wishlist_{id}",
            },
        },
    )

    if not len(response["Items"]):
        return None

    return _map_list(response["Items"][0])


def update_list(id: str, name: str, owner: str):
    result = dynamo_client.update_item(
        TableName=config.dynamodb_table,
        Key={
            "pk": {
                "S": owner,
            },
            "sk": {
                "S": f"wishlist_{id}",
            },
        },
        UpdateExpression="set #name = :name",
        ExpressionAttributeValues={
            ":name": {
                "S": name,
            },
        },
        ExpressionAttributeNames={
            "#name": "name",
        },
        ReturnValues="ALL_NEW",
    )

    return _map_list(result["Attributes"])


def delete_list(id: str, owner: str):
    for item in get_items(id):
        delete_item(id, item["id"], owner, skip_owner_check=True)

    dynamo_client.delete_item(
        TableName=config.dynamodb_table,
        Key={
            "pk": {
                "S": owner,
            },
            "sk": {
                "S": f"wishlist_{id}",
            },
        },
        ReturnValues="NONE",
    )


def get_items(id: str):
    response = dynamo_client.query(
        TableName=config.dynamodb_table,
        KeyConditionExpression="pk = :prefix",
        ExpressionAttributeValues={
            ":prefix": {
                "S": f"wishlist_{id}",
            },
        },
    )

    return [_map_item(item) for item in response["Items"]]


def create_item(list_id, owner, description, url, price):
    list = get_list(list_id)

    if list["owner"] != owner:
        raise AccessDeniedException("You do not own the requested list")

    item_id = hashlib.md5(uuid.uuid4().hex.encode("utf-8")).hexdigest()

    item = {
        "pk": {"S": f"wishlist_{list_id}"},
        "sk": {"S": f"item_{item_id}"},
        "description": {"S": description},
    }

    if url and len(url):
        item["url"] = {"S": url}

    if price and len(price):
        item["price"] = {"S": price}

    dynamo_client.put_item(TableName=config.dynamodb_table, Item=item)

    return {"id": item_id, "description": description, "url": url, "price": price}


def update_item(
    list_id: str, item_id: str, owner: str, description: str, url: str, price: str
):
    list = get_list(list_id)

    if list["owner"] != owner:
        raise AccessDeniedException("You do not own the requested list")

    updates = {"description": {"Action": "PUT", "Value": {"S": description}}}

    if url and len(url):
        updates["url"] = {"Action": "PUT", "Value": {"S": url}}
    else:
        updates["url"] = {"Action": "DELETE"}

    if price and len(price):
        updates["price"] = {"Action": "PUT", "Value": {"S": price}}
    else:
        updates["price"] = {"Action": "DELETE"}

    dynamo_client.update_item(
        TableName=config.dynamodb_table,
        Key={
            "pk": {
                "S": f"wishlist_{list_id}",
            },
            "sk": {
                "S": f"item_{item_id}",
            },
        },
        AttributeUpdates=updates,
    )

    return {"id": item_id, "description": description, "url": url, "price": price}


def delete_item(list_id: str, item_id: str, owner: str, skip_owner_check: bool = False):
    list = get_list(list_id)

    if not skip_owner_check and list["owner"] != owner:
        raise AccessDeniedException("You do not own the requested list")

    dynamo_client.delete_item(
        TableName=config.dynamodb_table,
        Key={
            "pk": {
                "S": f"wishlist_{list_id}",
            },
            "sk": {
                "S": f"item_{item_id}",
            },
        },
        ReturnValues="NONE",
    )
