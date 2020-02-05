provider "heroku" {
  email   = var.heroku_email
  api_key = var.heroku_api_key
}

resource "heroku_app" "task-manager" {
  name   = var.heroku_app_name
  region = "us"
}
