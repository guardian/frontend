package controllers

import model.NoCache
import play.api.mvc._
import common.ExecutionContexts
import services.{PlaySigninService, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import utils.SafeLogging
import idapiclient.{UserCookie, IdApiClient}
import scala.concurrent.Future
import model.SignoutDiscaringCookies

class SignoutController(returnUrlVerifier: ReturnUrlVerifier,
                        conf: IdentityConfiguration,
                        api: IdApiClient,
                        idRequestParser : IdRequestParser,
                        signinService: PlaySigninService)
  extends Controller with ExecutionContexts with SafeLogging {

  def signout = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    request.cookies.get("SC_GU_U").map { cookie =>
      val unAuthResponse =  api.unauth( UserCookie(cookie.value), idRequest.trackingData)
      signinService.getCookies(unAuthResponse, rememberMe = true) map {
        case Left(errors) => {
          logger.info(s"Error returned from API signout: ${errors.map(_.description).mkString(", ")}")
          performSignout(request)
        }
        case Right(responseCookies) => performSignout(request).withCookies(responseCookies: _*)
      }
    }.getOrElse {
      logger.info("User attempting signout without SC_GU_U cookie")
      Future.successful(performSignout(request))
    }
  }

  private def performSignout(request: RequestHeader) =
    NoCache(Found(
      returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
    ).discardingCookies(SignoutDiscaringCookies(conf.id.domain):_*))
}
