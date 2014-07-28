package controllers.admin

import com.gu.googleauth.{GoogleAuth, GoogleAuthConfig, GoogleAuthResult, UserIdentity}
import common.ExecutionContexts
import conf.Configuration
import org.joda.time.DateTime
import play.Play
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future
import scala.concurrent.duration._

object OAuthLoginController extends Controller with ExecutionContexts {
  import play.api.Play.current

  val maxAuthAge: Long = if (Play.isDev) 10.minutes.toSeconds else 0
  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  val ANTI_FORGERY_KEY = "antiForgeryToken"
  val forbiddenNoCredentials = Forbidden("You do not have OAuth credentials set")
  val googleAuthConfig: Option[GoogleAuthConfig] = Configuration.faciatool.oauthCredentials.map { cred =>
    GoogleAuthConfig(
      cred.oauthClientId,     // The client ID from the dev console
      cred.oauthSecret,       // The client secret from the dev console
      cred.oauthCallback,     // The redirect URL Google send users back to (must be the same as
      // that configured in the developer console)
      Some("guardian.co.uk"), // Google App domain to restrict login
      Some(0)
    )
  }

  // this is the only place we use LoginAuthAction - to prevent authentication redirect loops
  def login = Action { request =>
    googleAuthConfig.map { _ =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(error, "Test"))
    }.getOrElse(forbiddenNoCredentials)
  }

  /*
  Redirect to Google with anti forgery token (that we keep in session storage - note that flashing is NOT secure)
   */
  def loginAction = Action.async { implicit request =>
    googleAuthConfig.map { config =>
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
    googleAuthConfig.map { config =>
      request.session.get(ANTI_FORGERY_KEY) match {
        case None =>
          Future.successful(Redirect(routes.OAuthLoginController.login())
            .withNewSession
            .flashing("error" -> "Anti forgery token missing in session")
          )
        case Some(token) =>
          GoogleAuth.executeGoogleAuth(config, token).map {
            googleAuthResult: GoogleAuthResult =>
              // We store the URL a user was trying to get to in the LOGIN_ORIGIN_KEY inAuthActions.AuthAction
              // Redirect a user back there now if it exists
              val identity: UserIdentity = googleAuthResult.userIdentity
              val redirect = request.session.get(LOGIN_ORIGIN_KEY) match {
                case Some(url) => Redirect(url)
                case None => Redirect(routes.FaciaToolController.priorities())
              }
              // Store the JSON representation of the identity in the session - this is checked byAuthActions.AuthAction later
              val sessionAdd: Seq[(String, String)] = Seq(
                Option((UserIdentity.KEY, Json.toJson(identity).toString())),
                Option((Configuration.cookies.lastSeenKey, DateTime.now.toString())),
                googleAuthResult.userInfo.picture.map("avatarUrl" -> _)
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
