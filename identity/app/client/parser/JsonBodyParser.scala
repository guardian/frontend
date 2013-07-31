package client.parser

import net.liftweb.json.{MappingException, DefaultFormats}
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonParser._
import client.Error
import client.connection.HttpResponse

trait JsonBodyParser {
  implicit val formats = DefaultFormats + new JodaJsonSerializer

  def responseIsError(json: JValue, statusCode: Int): Boolean = statusCode > 299
  def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error]

  def extract[T](httpResponse: HttpResponse)(implicit man: Manifest[T]): Either[List[Error], T] = {
    try {
      extractJsonOrError(httpResponse).right.map{ _.extract[T] }
    } catch {
      case e: MappingException => Left(List(Error("Failed to extract data from JSON", e.getMessage)))
    }
  }

  def extractJsonOrError(httpResponse: HttpResponse): Either[List[Error], JValue] = {
    try {
      val json = parse(httpResponse.body)
      if (responseIsError(json, httpResponse.statusCode)) Left(extractErrorFromResponse(json, httpResponse.statusCode))
      else Right(json)
    } catch {
      case e: ParseException => Left(List(Error("Failed to parse JSON", e.getMessage)))
    }
  }
}
