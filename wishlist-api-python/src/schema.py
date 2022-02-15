from marshmallow import Schema, fields


class ItemSchema(Schema):
    description = fields.Str(required=True)
    url = fields.URL(allow_none=True)
    price = fields.Str(allow_none=True)


class ListSchema(Schema):
    name = fields.Str(required=True)
