package controllers

import conf.Configuration
import common.ExecutionContexts
import play.api.mvc._
import play.api.libs.openid.OpenID
import scala.concurrent.Future
import play.api.mvc.Results._
import play.api.mvc.SimpleResult
import play.api.libs.json.{JsNumber, JsString, JsObject, Json}

object Authenticated extends AuthAction(routes.Login.login.url)

object ExpiringAuthentication extends ExpiringAuthAction("/login")

object AjaxExpiringAuthentication extends ExpiringAuthAction("/login") {
  lazy val errorResponse =
    JsObject(
      Seq("error" -> JsObject(
        Seq(
            "status" -> JsNumber(403),
            "message" -> JsString("Forbidden")
            )
        )
      )
    )
  override def authFailResult(request: Request[AnyContent]): SimpleResult = Forbidden(Json.toJson(errorResponse))
}

object Login extends LoginController with Controller with ExecutionContexts {

  val loginUrl: String = routes.Login.login.url
  val baseUrl: String = "/admin"
  override val extraOpenIDParameters: Seq[String] = Seq(
    "openid.ns.pape=http://specs.openid.net/extensions/pape/1.0",
    "openid.pape.max_auth_age=0"
  )

  def openIdCallback(secure: Boolean)(implicit request: RequestHeader): String = routes.Login.openIDCallback.absoluteURL(secure)

  def login = Action {
    request =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(error, Configuration.environment.stage))
  }
}
