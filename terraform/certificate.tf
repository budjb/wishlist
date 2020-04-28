resource "aws_acm_certificate" "wishlist_cert" {
  domain_name               = "wishlist.budjb.com"
  subject_alternative_names = ["api.wishlist.budjb.com"]
  validation_method         = "DNS"
  tags = {
    Name: "Wishlist"
  }
}

resource "aws_route53_record" "cert_validation" {
  name    = aws_acm_certificate.wishlist_cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.wishlist_cert.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  records = [aws_acm_certificate.wishlist_cert.domain_validation_options.0.resource_record_value]
  ttl     = 60
}

resource "aws_route53_record" "cert_validation_alt1" {
  name    = aws_acm_certificate.wishlist_cert.domain_validation_options.1.resource_record_name
  type    = aws_acm_certificate.wishlist_cert.domain_validation_options.1.resource_record_type
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  records = [aws_acm_certificate.wishlist_cert.domain_validation_options.1.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn = aws_acm_certificate.wishlist_cert.arn

  validation_record_fqdns = [
    aws_route53_record.cert_validation.fqdn,
    aws_route53_record.cert_validation_alt1.fqdn,
  ]
}
