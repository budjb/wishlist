terraform {
  backend "s3" {
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_acm_certificate" "wishlist_cert" {
  domain_name               = "wishlist.budjb.com"
  subject_alternative_names = ["api.wishlist.budjb.com"]
  validation_method         = "DNS"
}

data "aws_route53_zone" "budjb_com_zone" {
  name = "budjb.com"
}
