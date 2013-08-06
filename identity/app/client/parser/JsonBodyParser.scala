package client.parser

import net.liftweb.json.{MappingException, DefaultFormats}
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonParser._
import client.{Logging, Error, Response}
import client.connection.HttpResponse

trait JsonBodyParser extends Logging {
  implicit val formats = DefaultFormats + new JodaJsonSerializer

  def responseIsError(json: JValue, statusCode: Int): Boolean = statusCode > 299
  def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error]

  def extract[T](httpResponse: Response[HttpResponse])(implicit man: Manifest[T]): Response[T] = {
    try {
      httpResponse.right.flatMap(response => {
        extractJsonOrError(response).right.map { _.extract[T] }
      })
    } catch {
      case e: MappingException => {
        logger.error("JSON mapping exception", e)
        Left(List(Error("Failed to extract data from JSON", e.getMessage)))
      }
    }
  }

  def extractJsonOrError(httpResponse: HttpResponse): Response[JValue] = {
    try {
      val json = parse(httpResponse.body)
      if (responseIsError(json, httpResponse.statusCode)) Left(extractErrorFromResponse(json, httpResponse.statusCode))
      else Right(json)
    } catch {
      case e: ParseException => {
        logger.error("JSON parse exception", e)
        Left(List(Error("Failed to parse JSON", e.getMessage)))
      }
    }
  }
}
