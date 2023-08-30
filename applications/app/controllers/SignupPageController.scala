package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, Cached, NoCache}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import play.filters.csrf.CSRFAddToken
import renderers.DotcomRenderingService
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponseV2
import staticpages.StaticPages
import implicits.Requests.RichRequestHeader

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration._
import model.dotcomrendering.DotcomNewslettersPageRenderingDataModel
import model.SimplePage
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

  private def remoteRenderNewslettersPage()(implicit
      request: RequestHeader,
  ): Result = {

    val newsletters: Either[String, List[NewsletterResponseV2]] =
      newsletterSignupAgent.getV2Newsletters()

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
        remoteRenderNewslettersPage()
      }
    }

  private def renderDCRNewslettersJson()(implicit
      request: RequestHeader,
  ): Result = {
    val newsletters: Either[String, List[NewsletterResponseV2]] =
      newsletterSignupAgent.getV2Newsletters()

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

  def renderNewslettersJson()(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        renderDCRNewslettersJson()
      }
    }
}
