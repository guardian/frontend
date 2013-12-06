package client.parser

import net.liftweb.json.{Formats, MappingException, DefaultFormats}
import net.liftweb.json.JsonAST.{JNothing, JValue}
import net.liftweb.json.JsonParser._
import client.{Logging, Error, Response}
import client.connection.HttpResponse

trait JsonBodyParser extends Logging {
  implicit val formats: Formats

  def responseIsError(json: JValue, statusCode: Int): Boolean = statusCode > 299
  def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error]

  def extract[T](extractJsonObj: JValue => JValue = {json => json})(httpResponseResponse: Response[HttpResponse])(implicit successType: Manifest[T]): Response[T] = {
    httpResponseResponse.right.flatMap { httpResponse =>
      try {
        (successType, httpResponse) match {
          case (_, HttpResponse(body, status, message)) if status == 502 =>
            Left(List(Error("Bad gateway", "The server was not available", 502)))
          case (_, HttpResponse(body, status, message)) if status == 503 =>
            Left(List(Error("Service unavailable", "The service was not available", 503)))
          case (_, HttpResponse(body, status, message)) if status == 504 =>
            Left(List(Error("Gateway timeout", "The service did not respond", 504)))
          case (_, HttpResponse(body, status, message)) if status > 299 =>
            Left(extractErrorFromResponse(parse(body), httpResponse.statusCode))
          case (extractType, HttpResponse(body, status, message)) if extractType == manifest[Unit] =>
            Right().asInstanceOf[Right[List[client.Error], T]]
          case (_, HttpResponse(body, status, message)) =>
            Right(extractJsonObj(parse(body)).extract[T])
        }
      } catch {
        case e: MappingException => {
          logger.error("JSON mapping exception", e)
          Left(List(Error("JSON mapping exception", "The api returned some json that did not match the expected format:" + successType.runtimeClass.getName, 500, Some(successType.runtimeClass.getName))))
        }
        case e: ParseException => {
          logger.error("JSON parse exception", e)
          Left(List(Error("JSON parsing exception", "The api returned a response that was not valid json:" + e.getMessage)))
        }
      }
    }
  }

  def extractUnit(httpResponseResponse: Response[HttpResponse]): Response[Unit] = {
    extract[Unit](_ => JNothing)(httpResponseResponse)
  }
}
object JsonBodyParser {
  def jsonField(field: String)(json: JValue): JValue = json \ field
}
