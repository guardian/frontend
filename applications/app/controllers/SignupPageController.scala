package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.RevalidatableResult
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import play.filters.csrf.CSRFAddToken
import services.newsletters.GroupedNewslettersResponse.GroupedNewslettersResponse
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import staticpages.StaticPages
import services.SimplePageRemoteRenderer

import scala.concurrent.ExecutionContext
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

  def getShouldUseRemoteRender()(implicit
      request: RequestHeader,
  ): Boolean = {
    request.getQueryString("dcr").contains("true")
  }

  def localRenderNewslettersPage()(implicit
      request: RequestHeader,
  ): Result = {
    val groupedNewsletters: Either[String, GroupedNewslettersResponse] =
      newsletterSignupAgent.getGroupedNewsletters()
    groupedNewsletters match {
      case Right(groupedNewsletters) =>
        Cached(defaultCacheDuration)(
          RevalidatableResult.Ok(
            NewsletterHtmlPage.html(StaticPages.simpleNewslettersPage(request.path, groupedNewsletters)),
          ),
        )
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        NoCache(InternalServerError)
    }
  }

  def remoteRenderNewslettersPage()(implicit
      request: RequestHeader,
  ): Result = {

    val newsletters: Either[String, List[NewsletterResponse]] =
      newsletterSignupAgent.getNewsletters()

    newsletters match {
      case Right(newsletters) =>
        SimplePageRemoteRenderer.renderNewslettersPage(
          newsletters,
          StaticPages.dcrSimplenewsletterPage(request.path),
          wsClient,
        )
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        NoCache(InternalServerError)
    }
  }

  def renderNewslettersPage()(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val renderDcr: Boolean = getShouldUseRemoteRender()

        if (renderDcr) {
          remoteRenderNewslettersPage()
        } else {
          localRenderNewslettersPage()
        }
      }
    }

}
