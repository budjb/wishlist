import awsgi
from controller import app


def lambda_handler(event, context):
    return awsgi.response(app, event, context)
