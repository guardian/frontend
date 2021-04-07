package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.filters.csrf.CSRFAddToken
import services.newsletters.{GroupedNewslettersAgent, GroupedNewslettersResponse}
import staticpages.StaticPages

import scala.concurrent.duration._

class SignupPageController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    csrfAddToken: CSRFAddToken,
    groupedNewslettersAgent: GroupedNewslettersAgent,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  val defaultCacheDuration: Duration = 15.minutes

  def logApiError(error: String): Unit = {
    log.error(s"API call to get newsletters failed: $error")
  }

  def renderNewslettersPage(): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val groupedNewsletters: Either[String, GroupedNewslettersResponse] =
          groupedNewslettersAgent.getGroupedNewsletters()

        groupedNewsletters match {
          case Right(groupedNewsletters) =>
            Cached(defaultCacheDuration)(
              RevalidatableResult.Ok(
                NewsletterHtmlPage.html(StaticPages.simpleNewslettersPage(request.path, groupedNewsletters.toList())),
              ),
            )
          case Left(e) =>
            logApiError(e)
            Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
        }
      }
    }

}
