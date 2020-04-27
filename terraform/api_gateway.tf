data "aws_iam_policy_document" "api_gateway_assumption_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda_invoke" {
  statement {
    actions = [
      "logs:*",
      "lambda:InvokeFunction",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "api_gateway_role" {
  name               = "wishlist_api_gateway"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assumption_policy.json
}

resource "aws_iam_role_policy" "api_gateway_lambda_policy" {
  name   = "wishlist_lambda_policy"
  role   = aws_iam_role.api_gateway_role.id
  policy = data.aws_iam_policy_document.lambda_invoke.json
}

data "template_file" "api_gateway_spec" {
  template = var.swagger_template

  vars = {
    lambda_arn = aws_lambda_function.wishlist_api.arn
    role_arn   = aws_iam_role.api_gateway_role.arn
  }
}

resource "aws_api_gateway_rest_api" "api_gateway" {
  name = "wishlist"
  body = data.template_file.api_gateway_spec.rendered
}

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = "release"

  variables = {
    "version" = md5(data.template_file.api_gateway_spec.rendered)
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_domain_name" "api_gateway_custom_domain" {
  domain_name     = "api.wishlist.budjb.com"
  certificate_arn = aws_acm_certificate.wishlist_cert.arn
}

resource "aws_api_gateway_base_path_mapping" "basepath" {
  api_id      = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = aws_api_gateway_deployment.api_gateway_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.api_gateway_custom_domain.domain_name
  base_path   = "/"
}

resource "aws_route53_record" "custom_domain_record" {
  count   = var.enable_custom_domain ? 1 : 0
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  name    = "api.wishlist.budjb.com"
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api_gateway_custom_domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api_gateway_custom_domain.cloudfront_zone_id
    evaluate_target_health = false
  }
}
