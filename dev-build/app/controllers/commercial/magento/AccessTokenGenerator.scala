package controllers.commercial.magento

import conf.Configuration
import model.NoCache
import play.api.libs.oauth._
import play.api.mvc.{Action, Controller, Result}

/**
 * For one-off generation of Magento access tokens.
 * The bookshop is a Magento service.
 */
class AccessTokenGenerator extends Controller {

  private lazy val authService = for {
    domain <- Configuration.commercial.magento.domain
    consumerKey <- Configuration.commercial.magento.consumerKey
    consumerSecret <- Configuration.commercial.magento.consumerSecret
    authorizationPath <- Configuration.commercial.magento.authorizationPath
  } yield {
    OAuth(ServiceInfo(
      requestTokenURL = s"http://$domain/oauth/initiate",
      accessTokenURL = s"http://$domain/oauth/token",
      authorizationURL = s"http://$domain/$authorizationPath",
      key = ConsumerKey(consumerKey, consumerSecret)),
      use10a = true)
  }

  private val unavailable: Result = ServiceUnavailable("Missing properties.")

  def generate = Action { implicit request =>

    def genRequestToken(): Result = {
      authService.fold(unavailable) { auth =>
        val callbackUrl = routes.AccessTokenGenerator.generate().absoluteURL()
        auth.retrieveRequestToken(callbackUrl) match {
          case Right(t) =>
            Redirect(auth.redirectUrl(t.token)).withSession("token" -> t.token, "secret" -> t.secret)
          case Left(e) => throw e
        }
      }
    }

    def requestTokenFromSession: RequestToken = {
      (for {
        token <- request.session.get("token")
        secret <- request.session.get("secret")
      } yield {
        RequestToken(token, secret)
      }).get
    }

    def genAccessToken(tokenPair: RequestToken, verifier: String): Result = {
      authService.fold(unavailable) { auth =>
        auth.retrieveAccessToken(tokenPair, verifier) match {
          case Left(e) => throw e
          case Right(accessToken) =>
            Ok(s"Token: ${accessToken.token}\nSecret: ${accessToken.secret}").withSession()
        }
      }
    }

    val result = request.getQueryString("oauth_verifier") map { verifier =>
      genAccessToken(requestTokenFromSession, verifier)
    } getOrElse genRequestToken()

    NoCache(result)
  }
}

object AccessTokenGenerator extends AccessTokenGenerator
