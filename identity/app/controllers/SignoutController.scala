package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.ReturnUrlVerifier
import com.google.inject.{Inject, Singleton}
import conf.IdentityConfiguration
import utils.SafeLogging


@Singleton
class SignoutController @Inject()(returnUrlVerifier: ReturnUrlVerifier, conf: IdentityConfiguration)
  extends Controller with ExecutionContexts with SafeLogging {

  def signout = Action { implicit request =>
    Found(
      returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
    ).discardingCookies(
      DiscardingCookie("GU_U", "/", Some(conf.id.domain), false),
      DiscardingCookie("SC_GU_U", "/", Some(conf.id.domain), true)
    )
  }
}
