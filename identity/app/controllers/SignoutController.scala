package controllers

import play.api.mvc._
import play.api.data.Forms
import model.IdentityPage
import play.api.data.Form
import common.ExecutionContexts
import services.ReturnUrlVerifier
import com.google.inject.{Inject, Singleton}
import conf.IdentityConfiguration


@Singleton
class SignoutController @Inject()(returnUrlVerifier: ReturnUrlVerifier, conf: IdentityConfiguration) extends Controller with ExecutionContexts {

  def signout = Action { implicit request =>
    Found(
      returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl)
    ).discardingCookies(
      DiscardingCookie("GU_U", "/", Some(conf.id.domain), false),
      DiscardingCookie("SC_GU_U", "/", Some(conf.id.domain), true)
    )
  }
}
