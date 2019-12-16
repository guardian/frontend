package controllers

import common.ImplicitControllerExecutionContext
import conf.Configuration
import form.Mappings
import idapiclient.responses.{CookieResponse, CookiesResponse}
import idapiclient.{EmailPassword, IdApiClient, TrackingData}
import model.{ApplicationContext, Cors, NoCache}
import org.joda.time.DateTime
import play.api.data.{Form, Forms}
import play.api.http.HttpConfiguration
import play.api.libs.json.{Format, JodaWrites, Json, Writes}
import play.api.mvc._
import services._
import utils.SafeLogging

import scala.concurrent.Future

object EmailPasswordForm {
  val emailPasswordForm = Form(
    Forms.mapping(
      "email" -> Forms.email,
      "password" -> Forms.nonEmptyText,
      "token" -> Forms.optional(Forms.nonEmptyText)
    )(EmailPassword.apply)(EmailPassword.unapply)
  )
}

trait IdentityJsonProtocol {

  implicit val dtFormat = Format[DateTime](play.api.libs.json.JodaReads.DefaultJodaDateTimeReads, play.api.libs.json.JodaWrites.JodaDateTimeWrites)
  implicit val cookiesFormat = Json.format[CookieResponse]
  implicit val cookieFormat = Json.format[CookiesResponse]
}

class AuthenticationController(
  api : IdApiClient,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder,
  authenticationService: AuthenticationService,
  signInService : PlaySigninService,
  val controllerComponents: ControllerComponents,
  val httpConfiguration: HttpConfiguration
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with SafeLogging with Mappings with implicits.Forms with IdentityJsonProtocol {

  private val fallbackAccessControlOrigin = Configuration.ajax.corsOrigins.headOption.getOrElse(Configuration.site.host)

  def authenticateUsernamePassword(): Action[AnyContent] = Action.async { implicit request =>
    val form = EmailPasswordForm.emailPasswordForm.bindFromRequest()
    val idRequest = idRequestParser(request)
    form.fold(
       formWithErrors => {
         Future.successful(NoCache(InternalServerError(Json.toJson(formWithErrors.errors.map(_.toString)))))
       },
       emailPassword => {
         val authResponse = signInService.getCookies(api.authBrowser(emailPassword, idRequest.trackingData), rememberMe = true)
         authResponse.map {
           case Right(cookies) =>
             Cors(NoCache(Ok("{}")), fallbackAllowOrigin = Some(fallbackAccessControlOrigin)).withCookies(cookies: _*)
           case Left(errors) =>
             Cors(NoCache(InternalServerError(Json.toJson(errors))), fallbackAllowOrigin = Some(fallbackAccessControlOrigin))
         }
       }
    )
  }
}
