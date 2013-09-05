package client.parser

import net.liftweb.json.{Formats, MappingException, DefaultFormats}
import net.liftweb.json.JsonAST.JValue
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
}
