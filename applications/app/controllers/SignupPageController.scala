package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.filters.csrf.CSRFAddToken
import services.newsletters.{GroupedNewslettersResponse, NewsletterSignupAgent}
import staticpages.StaticPages

import scala.concurrent.duration._

class SignupPageController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    csrfAddToken: CSRFAddToken,
    newsletterSignupAgent: NewsletterSignupAgent,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  val defaultCacheDuration: Duration = 15.minutes

  def renderNewslettersPage(): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val groupedNewsletters: Either[String, GroupedNewslettersResponse] =
          newsletterSignupAgent.getGroupedNewsletters()

        groupedNewsletters match {
          case Right(groupedNewsletters) =>
            Cached(defaultCacheDuration)(
              RevalidatableResult.Ok(
                NewsletterHtmlPage.html(StaticPages.simpleNewslettersPage(request.path, groupedNewsletters.toList())),
              ),
            )
          case Left(e) =>
            log.error(s"API call to get newsletters failed: $e")
            NoCache(InternalServerError)
        }
      }
    }

  def renderNewsletterDetailPage(listName:String): Action[AnyContent] =
    Action { implicit request =>

      val newsletter = newsletterSignupAgent.getNewsletterByName(listName)

      newsletter match {
        case Right(Some(newsletter)) =>
          Cached(15.minute)(
            RevalidatableResult.Ok(
              "There is a newsletter called "+newsletter.name
            ),
          )
        case Right(None) =>
          Cached(15.minute)(WithoutRevalidationResult(NotFound))
        case Left(e) =>
          Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
      }

    }
}
