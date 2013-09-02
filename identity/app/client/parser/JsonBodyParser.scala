package client.parser

import net.liftweb.json.{MappingException, DefaultFormats}
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonParser._
import client.{Logging, Error, Response}
import client.connection.HttpResponse
import com.gu.identity.model.LiftJsonConfig

trait JsonBodyParser extends Logging {
  implicit val formats = LiftJsonConfig.formats + new JodaJsonSerializer

  def responseIsError(json: JValue, statusCode: Int): Boolean = statusCode > 299
  def extractErrorFromResponse(json: JValue, statusCode: Int): List[Error]

  def extract[T](extractJsonObj: JValue => JValue = {json => json})(httpResponse: Response[HttpResponse])(implicit man: Manifest[T]): Response[T] = {
    try {
      httpResponse.right.flatMap(response => {
        extractJsonOrError(response).right.map { extractJsonObj(_).extract[T] }
      })
    } catch {
      case e: MappingException => {
        logger.error("JSON mapping exception", e)
        Left(List(Error("JSON mapping exception", "The api returned some json that did not match the expected format:" + man.runtimeClass.getName, 500, Some(man.runtimeClass.getName))))
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
        Left(List(Error("JSON parsing exception", "The api returned a response that was not valid json:" + e.getMessage)))
      }
    }
  }
}
