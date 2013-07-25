package client.parser

import net.liftweb.json.{MappingException, DefaultFormats}
import com.gu.identity.model.{Error, ErrorResponse}
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonParser._

trait JsonParser {
  implicit val formats = DefaultFormats + new JodaJsonSerializer

  def extract[T](jsonString: String, statusCode: Int = 500)(implicit man: Manifest[T]): Either[ErrorResponse, T] = {
    try {
      extractJsonOrError(jsonString).right.map{ _.extract[T] }
    } catch {
      case e: MappingException => Left(ErrorResponse(500, Error("Failed to extract data from JSON", e.getMessage)))
    }
  }

  def extractJsonOrError(jsonString: String, statusCode: Int = 500): Either[ErrorResponse, JValue] = {
    try {
      val json = parse(jsonString)
      if ("error" == json \ "status") Left(ErrorResponse(statusCode, (json \ "errors").extract[List[Error]]))
      else Right(json)
    } catch {
      case e: ParseException => Left(ErrorResponse(500, Error("Failed to parse JSON", e.getMessage)))
    }
  }
}
