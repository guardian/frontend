package client

case class Error(message: String, description: String, statusCode: Int = 500)
