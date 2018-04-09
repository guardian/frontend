package controllers

import common.ImplicitControllerExecutionContext
import model.{ApplicationContext, Cached}
import model.Cached.RevalidatableResult
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.filters.csrf.CSRFAddToken
import staticpages.StaticPages

import scala.concurrent.duration._

class SignupPageController(
  wsClient: WSClient,
  val controllerComponents: ControllerComponents,
  csrfAddToken: CSRFAddToken
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext {

  val defaultCacheDuration: Duration = 15.minutes

  def renderNewslettersPage(): Action[AnyContent] = csrfAddToken {
    Action { implicit request =>
      Cached(defaultCacheDuration)(
        RevalidatableResult.Ok(
          NewsletterHtmlPage.html(StaticPages.simpleNewslettersPage(request.path))
        )
      )
    }
  }

}
