import json
from flask import Flask, jsonify, request, g
from flask_cors import CORS

from schema import ItemSchema, ListSchema
from marshmallow import ValidationError
from auth import requires_auth
from error import HttpException, AccessDeniedException
import client

app = Flask(__name__)
CORS(app)


@app.errorhandler(HttpException)
def handler_unauthenticated(e):
    response = jsonify({"error": e.error})
    response.status_code = e.status_code
    return response


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "ok"})


@app.route("/wishlists", methods=["GET"])
@requires_auth
def get_lists():
    try:
        return jsonify(client.get_lists(g.profile["email"]))
    except Exception as e:
        print(f"error retrieving a list of wishlists: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists", methods=["POST"])
@requires_auth
def create_list():
    try:
        parsed = ListSchema().load(request.json)
        result = client.create_list(g.profile["email"], parsed["name"])
        return jsonify(result), 201
    except ValidationError as e:
        return jsonify(e.messages), 400
    except Exception as e:
        print(f"error creating a wishlist: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<id>", methods=["GET"])
def get_list(id):
    try:
        return jsonify(client.get_list(id))
    except Exception as e:
        print(f"error retrieving wishlist with ID {id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<id>", methods=["PUT"])
@requires_auth
def update_list(id):
    try:
        parsed = ListSchema().load(request.json)
        result = client.update_list(id, parsed["name"], g.profile["email"])
        return jsonify(result)
    except ValidationError as e:
        return jsonify(e.messages), 400
    except Exception as e:
        print(f"error updating wishlist {id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<id>", methods=["DELETE"])
@requires_auth
def delete_list(id):
    try:
        client.delete_list(id, g.profile["email"])
        return "", 204
    except Exception as e:
        print(f"error deleting wishlist {id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<list_id>/items", methods=["GET"])
def get_list_items(list_id):
    try:
        return jsonify(client.get_items(list_id))
    except Exception as e:
        print(f"error retrieving a items for wishlist {list_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<list_id>/items", methods=["POST"])
@requires_auth
def create_item(list_id):
    try:
        body = request.json

        if "url" in body and body["url"] == "":
            body["url"] = None

        parsed = ItemSchema().load(body)
        result = client.create_item(
            list_id,
            g.profile["email"],
            parsed["description"],
            parsed["url"],
            parsed["price"],
        )
        return jsonify(result), 201
    except ValidationError as e:
        return jsonify(e.messages), 400
    except AccessDeniedException as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        print(f"error adding an item to wishlist {list_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<list_id>/items/<item_id>", methods=["PUT"])
@requires_auth
def update_item(list_id, item_id):
    try:
        body = request.json

        if "url" in body and body["url"] == "":
            body["url"] = None

        parsed = ItemSchema().load(body)
        result = client.update_item(
            list_id,
            item_id,
            g.profile["email"],
            parsed["description"],
            parsed["url"],
            parsed["price"],
        )
        return jsonify(result)
    except ValidationError as e:
        return jsonify(e.messages), 400
    except AccessDeniedException as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        print(f"error updating item {item_id} in wishlist {list_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/wishlists/<list_id>/items/<item_id>", methods=["DELETE"])
@requires_auth
def delete_item(list_id, item_id):
    try:
        client.delete_item(list_id, item_id, g.profile["email"])
        return "", 204
    except AccessDeniedException as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        print(f"error deleting item {item_id} in wishlist {list_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500
