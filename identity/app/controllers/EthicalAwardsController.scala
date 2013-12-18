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

  def ethicalAwardsForm(formId: String) = authAction.apply { implicit request =>
    if (Switches.IdentityFormstackSwitch.isSwitchedOn) {
      val idRequest = idRequestParser(request)
      Ok(views.html.ethicalAwards.ethicalAwardsForm(page, formId, idRequest, idUrlBuilder))
    } else {
      NotFound(views.html.errors._404())
    }
  }
}
