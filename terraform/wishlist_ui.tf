locals {
  ui_s3_origin_id = "wishlist-ui-s3"
}

###########################################################
# S3 Bucket                                               #
###########################################################

data "aws_iam_policy_document" "ui_bucket" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.ui_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.wishlist_ui.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "ui_bucket" {
  bucket = aws_s3_bucket.ui_bucket.id
  policy = data.aws_iam_policy_document.ui_bucket.json
}

resource "aws_s3_bucket" "ui_bucket" {
  bucket = "budjb-wishlist-ui"
}

resource "aws_s3_bucket_public_access_block" "ui_buicket" {
  bucket = aws_s3_bucket.ui_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

###########################################################
# SSL Certificate                                         #
###########################################################

resource "aws_acm_certificate" "wishlist_ui" {
  domain_name       = "wishlist.budjb.com"
  validation_method = "DNS"
  tags = {
    Name : "Wishlist UI"
  }
}

resource "aws_acm_certificate_validation" "wishlist_ui" {
  certificate_arn         = aws_acm_certificate.wishlist_ui.arn
  validation_record_fqdns = [for record in aws_route53_record.wishlist_ui_cert_validation : record.fqdn]
}

###########################################################
# Cloudfront Distribution                                 #
###########################################################

resource "aws_cloudfront_origin_access_identity" "wishlist_ui" {
  comment = "Wishlist UI access identity"
}

resource "aws_cloudfront_distribution" "wishlist_ui" {
  origin {
    domain_name = aws_s3_bucket.ui_bucket.bucket_regional_domain_name
    origin_id   = local.ui_s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.wishlist_ui.cloudfront_access_identity_path
    }

  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["wishlist.budjb.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.ui_s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wishlist_ui.arn
    ssl_support_method  = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}

###########################################################
# Route53                                                 #
###########################################################

resource "aws_route53_record" "wishlist_ui" {
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  name    = "wishlist.budjb.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.wishlist_ui.domain_name
    zone_id                = aws_cloudfront_distribution.wishlist_ui.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "wishlist_ui_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wishlist_ui.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  type            = each.value.type
  zone_id         = data.aws_route53_zone.budjb_com_zone.zone_id
  records         = [each.value.record]
  ttl             = 60
}
