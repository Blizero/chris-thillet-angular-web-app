from marshmallow import Schema, fields


class ResponseSchema(Schema):
    _id = fields.Str()
    username = fields.Str()
    prompt = fields.Str()
    response = fields.Str()
    time = fields.Str()
