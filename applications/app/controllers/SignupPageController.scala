package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import conf.switches.Switches.UseDcrNewslettersPage
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.RevalidatableResult
import pages.NewsletterHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import play.filters.csrf.CSRFAddToken
import renderers.DotcomRenderingService
import services.newsletters.GroupedNewslettersResponse.GroupedNewslettersResponse
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponseV2
import staticpages.StaticPages
import implicits.{HtmlFormat, JsonFormat}
import implicits.Requests.RichRequestHeader

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import model.dotcomrendering.DotcomNewslettersPageRenderingDataModel
import model.CacheTime

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
  ): Future[Result] = {
    val groupedNewsletters: Either[String, GroupedNewslettersResponse] =
      newsletterSignupAgent.getGroupedNewsletters()

    groupedNewsletters match {
      case Right(groupedNewsletters) =>
        Future.successful(
          Cached(defaultCacheDuration)(
            RevalidatableResult.Ok(
              NewsletterHtmlPage.html(StaticPages.simpleNewslettersPage(request.path, groupedNewsletters)),
            ),
          ),
        )
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        Future(NoCache(InternalServerError))
    }
  }

  private def remoteRenderNewslettersPage()(implicit
      request: RequestHeader,
  ): Future[Result] = {

    val newsletters: Either[String, List[NewsletterResponseV2]] =
      newsletterSignupAgent.getV2Newsletters()

    newsletters match {
      case Right(newsletters) =>
        remoteRenderer.getEmailNewsletters(
          ws = wsClient,
          newsletters = newsletters,
          page = StaticPages.dcrSimpleNewsletterPage(request.path),
        )
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        Future(NoCache(InternalServerError))
    }
  }

  private def renderDCRNewslettersJson()(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val newsletters: Either[String, List[NewsletterResponseV2]] =
      newsletterSignupAgent.getV2Newsletters()

    newsletters match {
      case Right(newsletters) => {
        val page = StaticPages.dcrSimpleNewsletterPage(request.path)
        val dataModel =
          DotcomNewslettersPageRenderingDataModel.apply(page, newsletters, request)
        val dataJson = DotcomNewslettersPageRenderingDataModel.toJson(dataModel)
        Future.successful(common.renderJson(dataJson, page).as("application/json"))
      }
      case Left(e) =>
        log.error(s"API call to get newsletters failed: $e")
        throw new RuntimeException()
    }
  }

  private def notFoundPage()(implicit
      request: RequestHeader,
  ): Future[Result] = {
    Future(Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound)))
  }

  def renderNewsletters()(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action.async { implicit request =>
        val useDCR = request.forceDCR || UseDcrNewslettersPage.isSwitchedOn

        request.getRequestFormat match {
          case HtmlFormat if useDCR =>
            remoteRenderNewslettersPage()
          case HtmlFormat =>
            localRenderNewslettersPage()
          case JsonFormat if useDCR =>
            renderDCRNewslettersJson()
          case _ => notFoundPage()
        }
      }
    }
}
