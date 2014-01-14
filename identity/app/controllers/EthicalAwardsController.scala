package controllers

import play.api.mvc._
import model.IdentityPage
import common.ExecutionContexts
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import conf.Switches


@Singleton
class EthicalAwardsController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                        idRequestParser: IdRequestParser,
                                        idUrlBuilder: IdentityUrlBuilder,
                                        authAction: actions.AuthAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/ethical-awards", "Ethical Awards", "ethical-awards")

  def ethicalAwardsForm(formReference: String) = authAction.apply { implicit request =>
    if (Switches.IdentityEthicalAwardsSwitch.isSwitchedOn) {
      val idRequest = idRequestParser(request)
      Ok(views.html.ethicalAwards.form(page, formReference, idRequest, idUrlBuilder))
    } else {
      logger.info(s"formstack switched off, attempt to access $formReference failed")
      NotFound(views.html.errors._404())
    }
  }

  def complete = Action { implicit request =>
    if (Switches.IdentityEthicalAwardsSwitch.isSwitchedOn) {
      Ok(views.html.ethicalAwards.complete(page))
    } else {
      NotFound(views.html.errors._404())
    }
  }
}
