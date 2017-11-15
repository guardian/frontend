package idapiclient.responses

import play.api.libs.json.Json

/**
  * FIXME:
  *   This seems to be exactly the same as com.gu.identity.model.Error from identity-request library.
  *   Is this only representing IDAPI errors?
  */
case class Error(message: String, description: String, statusCode: Int = 500, context: Option[String] = None)

object Error {
  implicit val errorFormat = Json.format[Error]
}
