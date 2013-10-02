package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import conf.IdentityConfiguration
import utils.SafeLogging
import idapiclient.{UserCookie, IdApiClient}
import scala.concurrent.Future


@Singleton
class SignoutController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                  conf: IdentityConfiguration,
                                  api: IdApiClient,
                                  idRequestParser : IdRequestParser)
  extends Controller with ExecutionContexts with SafeLogging {

  def signout = Action.async { implicit request =>
    val idRequest = idRequestParser(request)
    request.cookies.get("SC_GU_U").map(cookie => UserCookie(cookie.value)).map { auth =>
      api.unauth(idRequest.omnitureData, auth).map { response =>
        response.left.foreach(errors => logger.info("Error returned from API signout"))
        performSignout(request)
      }
    }.getOrElse(Future.successful(performSignout(request)))
  }

  private def performSignout(request: RequestHeader) = {
    Found(
      returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
    ).discardingCookies(
      DiscardingCookie("GU_U", "/", Some(conf.id.domain), false),
      DiscardingCookie("SC_GU_U", "/", Some(conf.id.domain), true)
    )
  }
}
