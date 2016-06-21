package controllers.admin

import com.gu.googleauth.{GoogleAuth, UserIdentity}
import common.ExecutionContexts
import conf.Configuration
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class OAuthLoginController extends Controller with ExecutionContexts {
  import play.api.Play.current

  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  val ANTI_FORGERY_KEY = "antiForgeryToken"
  val forbiddenNoCredentials = Forbidden("You do not have OAuth credentials set")

  // this is the only place we use LoginAuthAction - to prevent authentication redirect loops
  def login = Action { implicit request =>
    val error = request.flash.get("error")
    Ok(views.html.auth.login(error, "Test"))
  }

  /*
  Redirect to Google with anti forgery token (that we keep in session storage - note that flashing is NOT secure)
   */
  def loginAction = Action.async { implicit request =>
    val host = Some(s"${if (request.secure) "https" else "http"}://${request.host}")
    conf.GoogleAuth(host).config.map { config =>
      val antiForgeryToken = GoogleAuth.generateAntiForgeryToken()
      GoogleAuth.redirectToGoogle(config, antiForgeryToken).map {
        _.withSession {
          request.session + (ANTI_FORGERY_KEY -> antiForgeryToken)
        }
      }
    }.getOrElse(Future.successful(forbiddenNoCredentials))
  }

  /*
  User comes back from Google.
  We must ensure we have the anti forgery token from the loginAction call and pass this into a verification call which
  will return a Future[UserIdentity] if the authentication is successful. If unsuccessful then the Future will fail.
   */
  def oauth2Callback = Action.async { implicit request =>
    val host = Some(s"${if (request.secure) "https" else "http"}://${request.host}")
    conf.GoogleAuth(host).config.map { config =>
      request.session.get(ANTI_FORGERY_KEY) match {
        case None =>
          Future.successful(Redirect(routes.OAuthLoginController.login())
            .withNewSession
            .flashing("error" -> "Anti forgery token missing in session")
          )
        case Some(token) =>
          GoogleAuth.validatedUserIdentity(config, token).map {
            userIdentity: UserIdentity =>
              // We store the URL a user was trying to get to in the LOGIN_ORIGIN_KEY inAuthActions.AuthActionTest
              // Redirect a user back there now if it exists
              val redirect = request.session.get(LOGIN_ORIGIN_KEY) match {
                case Some(url) => Redirect(url)
                case None => Redirect(routes.AdminIndexController.admin())
              }
              // Store the JSON representation of the identity in the session - this is checked byAuthActions.AuthActionTest later
              val sessionAdd: Seq[(String, String)] = Seq(
                Option((UserIdentity.KEY, Json.toJson(userIdentity).toString())),
                Option((Configuration.cookies.lastSeenKey, DateTime.now.toString()))
              ).flatten
              redirect
                .addingToSession(sessionAdd: _*)
                .removingFromSession(ANTI_FORGERY_KEY, LOGIN_ORIGIN_KEY)
          } recover {
            case t =>
              // you might want to record login failures here - we just redirect to the login page
              Redirect(routes.OAuthLoginController.login())
                .withSession(request.session - ANTI_FORGERY_KEY)
                .flashing("error" -> s"Login failure: ${t.toString}")
          }
      }
    }.getOrElse(Future.successful(forbiddenNoCredentials))
  }

  def logout = Action { implicit request =>
    Redirect(routes.OAuthLoginController.login()).withNewSession
  }
}
