package model.deploys

import play.api.libs.json.{Writes, _}
import play.api.mvc._

object ApiResults extends Results {

  case class ApiError(message: String, statusCode: Int)
  object ApiError { implicit val format = Json.format[ApiError] }

  case class ApiErrors(errors: List[ApiError]) {
    def statusCode: Int = errors.map(_.statusCode).max
  }

  type ApiResponse[T] = Either[ApiErrors, T]
  def apply[T](action: => ApiResponse[T])(implicit tjs: Writes[T]): Result = {
    action.fold(
      apiErrors =>
        Status(apiErrors.statusCode) {
          JsObject(
            Seq(
              "status" -> JsString("error"),
              "statusCode" -> JsNumber(apiErrors.statusCode),
              "errors" -> Json.toJson(apiErrors.errors),
            ),
          )
        },
      response =>
        Ok {
          JsObject(
            Seq(
              "status" -> JsString("ok"),
              "response" -> Json.toJson(response),
            ),
          )
        },
    )
  }
}
