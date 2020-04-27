resource "aws_dynamodb_table" "wishlist_table" {
  name         = "wishlist"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  global_secondary_index {
    name            = "wishlist_id"
    hash_key        = "sk"
    projection_type = "ALL"
  }
}
