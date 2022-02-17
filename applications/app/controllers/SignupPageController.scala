package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import pages.{NewsletterHtmlPage, NewsletterDetailHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.filters.csrf.CSRFAddToken
import services.newsletters.{GroupedNewslettersResponse, NewsletterSignupAgent, NewsletterResponse}
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

  def getNewslettersWithSameTheme(newsletter: NewsletterResponse): List[NewsletterResponse] = {
    val allNewsletters = newsletterSignupAgent.getNewsletters();
    allNewsletters match {
      case Right(allNewsletters) => allNewsletters
        .filter(_.theme == newsletter.theme)
        .filter(_.id != newsletter.id)
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        List()
    }
  }

  def renderNewsletterDetailPage(listName:String): Action[AnyContent] =
    Action { implicit request =>

      val newsletter = newsletterSignupAgent.getNewsletterByName(listName)

      newsletter match {
        case Right(Some(newsletter)) =>
          val recomendations = this.getNewslettersWithSameTheme(newsletter); // TO DO - proper method for picking and sorting recomendations
          Cached(15.minute)(
            RevalidatableResult.Ok(
              NewsletterDetailHtmlPage.html(StaticPages.simpleNewsletterDetailPage(request.path, newsletter, recomendations))
            ),
          )
        case Right(None) =>
          Cached(15.minute)(WithoutRevalidationResult(NotFound))
        case Left(e) =>
          Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
      }

    }
}
