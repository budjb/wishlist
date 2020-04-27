locals {
  lambda_dist_path = "${path.module}/../wishlist-api/dist/lambda.zip"
}

data "aws_iam_policy_document" "lambda_assumption_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com",
        "apigateway.amazonaws.com",
      ]
    }
  }
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    actions = [
      "logs:*",
      "lambda:InvokeFunction",
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "wishlist_api_role" {
  name               = "wishlist-api-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumption_policy.json
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda-policy"
  role   = aws_iam_role.wishlist_api_role.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_lambda_function" "wishlist_api" {
  function_name                  = "wishlist-api"
  filename                       = file(local.lambda_dist_path)
  source_code_hash               = filebase64sha256(local.lambda_dist_path)
  role                           = aws_iam_role.wishlist_api_role.arn
  handler                        = "lambda.handler"
  timeout                        = 10
  publish                        = true
  runtime                        = "nodejs12.x"
  description                    = "Wishlist API"

  tracing_config {
    mode = "PassThrough"
  }

  environment {
    variables = {}
  }
}

resource "aws_lambda_alias" "lambda_alias" {
  name             = var.stage
  function_name    = aws_lambda_function.wishlist_api.arn
  function_version = aws_lambda_function.wishlist_api.version
}
