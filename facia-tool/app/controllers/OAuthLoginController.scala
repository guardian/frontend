package controllers

import play.api.mvc.{Action, Controller}
import common.ExecutionContexts
import com.gu.googleauth.{GoogleAuthResult, UserIdentity, GoogleAuth, GoogleAuthConfig}
import scala.concurrent.Future
import play.api.libs.json.Json
import conf.Configuration
import org.joda.time.DateTime

object OAuthLoginController extends Controller with ExecutionContexts {
  import play.api.Play.current

  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  val ANTI_FORGERY_KEY = "antiForgeryToken"
  val googleAuthConfig =
    GoogleAuthConfig(
      "283258724824-gv88hsfbl2os5n9qlt2ocs8bu94cao5r.apps.googleusercontent.com",  // The client ID from the dev console
      "GMrS7OdO0cHCdb4pfRsm20wv",                  // The client secret from the dev console
      "http://localhost:9001/oauth2callback",      // The redirect URL Google send users back to (must be the same as
      // that configured in the developer console)
      Some("guardian.co.uk"),                      // Google App domain to restrict login
      Some(0)
    )

  // this is the only place we use LoginAuthAction - to prevent authentication redirect loops
  def login = Action { request =>
    val error = request.flash.get("error")
    Ok(views.html.auth.login(error, "Test"))
  }

  /*
  Redirect to Google with anti forgery token (that we keep in session storage - note that flashing is NOT secure)
   */
  def loginAction = Action.async { implicit request =>
    val antiForgeryToken = GoogleAuth.generateAntiForgeryToken()
    GoogleAuth.redirectToGoogle(googleAuthConfig, antiForgeryToken).map {
      _.withSession { request.session + (ANTI_FORGERY_KEY -> antiForgeryToken) }
    }
  }

  /*
  User comes back from Google.
  We must ensure we have the anti forgery token from the loginAction call and pass this into a verification call which
  will return a Future[UserIdentity] if the authentication is successful. If unsuccessful then the Future will fail.
   */
  def oauth2Callback = Action.async { implicit request =>
    request.session.get(ANTI_FORGERY_KEY) match {
      case None =>
        Future.successful(Redirect(routes.OAuthLoginController.login())
          .withNewSession
          .flashing("error" -> "Anti forgery token missing in session")
        )
      case Some(token) =>
        GoogleAuth.executeGoogleAuth(googleAuthConfig, token).map { googleAuthResult: GoogleAuthResult =>
        // We store the URL a user was trying to get to in the LOGIN_ORIGIN_KEY in AuthAction
        // Redirect a user back there now if it exists
          val identity: UserIdentity = googleAuthResult.userIdentity
          val redirect = request.session.get(LOGIN_ORIGIN_KEY) match {
            case Some(url) => Redirect(url)
            case None => Redirect(routes.FaciaToolController.priorities())
          }
          // Store the JSON representation of the identity in the session - this is checked by AuthAction later
          val sessionAdd: Seq[(String, String)] = Seq(
            Option((UserIdentity.KEY, Json.toJson(identity).toString())),
            Option((Configuration.cookies.lastSeenKey, DateTime.now.toString())),
            googleAuthResult.userInfo.picture.map("avatarUrl" -> _)
          ).flatten
          redirect
            .addingToSession(sessionAdd:_*)
            .removingFromSession(ANTI_FORGERY_KEY, LOGIN_ORIGIN_KEY)
        } recover {
          case t =>
            // you might want to record login failures here - we just redirect to the login page
            Redirect(routes.OAuthLoginController.login())
              .withSession(request.session - ANTI_FORGERY_KEY)
              .flashing("error" -> s"Login failure: ${t.toString}")
        }
    }
  }

  def logout = Action { implicit request =>
    Redirect(routes.OAuthLoginController.login()).withNewSession
  }
}
