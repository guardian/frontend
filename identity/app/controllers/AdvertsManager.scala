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

class AdvertsManager(
    returnUrlVerifier: ReturnUrlVerifier,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging
    with Mappings
    with Forms {

  val page = IdentityPage("/privacy-settings", "Cookies and advertising settings", isFlow = true)

  def renderAdvertsManager(returnUrl: Option[String]): Action[AnyContent] =
    Action { implicit request =>
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)
      val verifiedReturnUrl = verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl)

      NoCache(
        Ok(
          IdentityHtmlPage.html(
            content = views.html.advertsManager(verifiedReturnUrl, idUrlBuilder),
          )(page, request, context),
        ),
      )

    }

}
