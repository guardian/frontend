package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.RevalidatableResult
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import play.filters.csrf.CSRFAddToken
import renderers.DotcomRenderingService
import services.newsletters.GroupedNewslettersResponse.GroupedNewslettersResponse
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import staticpages.StaticPages
import implicits.Requests.RichRequestHeader

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration._
import model.dotcomrendering.DotcomNewslettersPageRenderingDataModel
import model.SimplePage

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
  val remoteRenderer = DotcomRenderingService()

  private def localRenderNewslettersPage()(implicit
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

  private def remoteRenderNewslettersPage()(implicit
      request: RequestHeader,
  ): Result = {

    val newsletters: Either[String, List[NewsletterResponse]] =
      newsletterSignupAgent.getNewsletters()

    newsletters match {
      case Right(newsletters) =>
        Await.result(
          remoteRenderer.getEmailNewsletters(
            ws = wsClient,
            newsletters = newsletters,
            page = StaticPages.dcrSimpleNewsletterPage(request.path),
          ),
          3.seconds,
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
        if (request.forceDCR) {
          remoteRenderNewslettersPage()
        } else {
          localRenderNewslettersPage()
        }
      }
    }

  def renderNewslettersJson()(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val newsletters: Either[String, List[NewsletterResponse]] =
          newsletterSignupAgent.getNewsletters()

        newsletters match {
          case Right(newsletters) => {
            val page = StaticPages.dcrSimpleNewsletterPage(request.path)
            val dataModel =
              DotcomNewslettersPageRenderingDataModel.apply(page, newsletters, request)
            val dataJson = DotcomNewslettersPageRenderingDataModel.toJson(dataModel)
            common.renderJson(dataJson, page).as("application/json")
          }
          case Left(e) =>
            log.error(s"API call to get newsletters failed: $e")
            throw new RuntimeException()
        }
      }
    }
}
