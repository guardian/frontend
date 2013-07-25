package client.connection

import client.parser.JsonParser
import com.gu.identity.model.ErrorResponse

case class HttpResponse(body: String, statusCode: Int, statusMessage: String) extends JsonParser {
  def extract[T](implicit man: Manifest[T]): Either[ErrorResponse, T] = extract[T](body, statusCode)(man)
}
