package controllers

import common.ImplicitControllerExecutionContext
import form.Mappings
import implicits.Forms
import model.{ApplicationContext, IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.http.HttpConfiguration
import play.api.mvc._
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier}
import utils.SafeLogging
import conf.switches.Switches.IdentityAdConsentsSwitch


class AdvertsManager(
    returnUrlVerifier: ReturnUrlVerifier,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration)
    (implicit context: ApplicationContext)
  extends BaseController
  with ImplicitControllerExecutionContext
  with SafeLogging
  with Mappings
  with Forms {

  val page = IdentityPage("/adverts/manage", "Manage Adverts", usesGuardianHeader = true)

  def renderAdvertsManager(returnUrl: Option[String]): Action[AnyContent] = Action { implicit request =>

    if(IdentityAdConsentsSwitch.isSwitchedOff) {
      NotFound(views.html.errors._404())
    } else {
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
      val verifiedReturnUrl = verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)

      NoCache(Ok(
        IdentityHtmlPage.html(
          content = views.html.advertsManager(verifiedReturnUrl,idUrlBuilder)
        )(page, request, context)
      ))
    }
  }

}
