package controllers

import actions.AuthenticatedActions
import common.ImplicitControllerExecutionContext
import form.Mappings
import idapiclient.{EmailPassword, IdApiClient, ScGuU}
import implicits.Forms
import model.{ApplicationContext, IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data._
import play.api.data.validation.Constraints
import play.api.http.HttpConfiguration
import play.api.i18n.{Messages, MessagesProvider}
import play.api.mvc._
import play.twirl.api.Html
import services.{IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import utils.SafeLogging

import scala.concurrent.Future

class AdvertsManager(
    returnUrlVerifier: ReturnUrlVerifier,
    api: IdApiClient,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    signInService : PlaySigninService,
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
    Ok(
      IdentityHtmlPage.html(
        content = Html("Hello")
      )(page, request, context)
    )
  }
}
