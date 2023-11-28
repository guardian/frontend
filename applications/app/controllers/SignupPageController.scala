package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import conf.switches.Switches.{UseDcrNewslettersPage}
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
import implicits.Requests.RichRequestHeader

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration._
import model.dotcomrendering.{DotcomNewslettersPageRenderingDataModel, DotcomNewsletterDetailPageRenderingDataModel}
import model.SimplePage
import model.CacheTime
import play.api.mvc.Results

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
        if (request.forceDCR || UseDcrNewslettersPage.isSwitchedOn) {
          remoteRenderNewslettersPage()
        } else {
          localRenderNewslettersPage()
        }
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

  private def renderNewslettersJson()(implicit
      request: RequestHeader,
  ): Result = {
    Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound))
  }

  def renderNewslettersJson()(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        if (request.forceDCR || UseDcrNewslettersPage.isSwitchedOn) {
          renderDCRNewslettersJson()
        } else {
          renderNewslettersJson()
        }
      }
    }

  private def newsletterDetailPageResult(newsletter: NewsletterResponseV2)(implicit
      request: RequestHeader,
  ): Result = {

    val backfillRecommendedNewsletters = newsletterSignupAgent.getBackfillRecommendationsFor(newsletter)

    Await.result(
      remoteRenderer.getEmailNewsletterDetail(
        ws = wsClient,
        newsletter = newsletter,
        backfillRecommendedNewsletters = backfillRecommendedNewsletters,
        page = StaticPages.dcrSimpleNewsletterDetailPage(request.path, newsletter),
      ),
      3.seconds,
    )
  }

  private def newsletterDetailJsonResult(newsletter: NewsletterResponseV2)(implicit
      request: RequestHeader,
  ): Result = {

    val backfillRecommendedNewsletters = newsletterSignupAgent.getBackfillRecommendationsFor(newsletter)

    val page = StaticPages.dcrSimpleNewsletterDetailPage(request.path, newsletter)
    val dataModel =
      DotcomNewsletterDetailPageRenderingDataModel.apply(page, newsletter, backfillRecommendedNewsletters, request)
    val dataJson = DotcomNewsletterDetailPageRenderingDataModel.toJson(dataModel)
    common.renderJson(dataJson, page).as("application/json")
  }

  // TO DO - define a class Left instead of using Strings
  private def getNewsletterIfLive(identityName: String)(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Either[String, NewsletterResponseV2] = {
    newsletterSignupAgent.getV2NewsletterByName(identityName) match {
      case Left(message) => Left(message)
      case Right(optionalNewsletter) =>
        optionalNewsletter match {
          case None             => Left("not found")
          case Some(newsletter) =>
            if (newsletter.restricted || newsletter.status != "live") {
              Left("denied")
            } else {
              Right(newsletter)
            }
        }
    }
  }

  def renderNewsletterDetailPage(identityName: String)(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        getNewsletterIfLive(identityName) match {
          case Left(message) => {
            // TO DO - render proper user-facing error pages here
            if (message == "not found") {
              Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound))
            } else {
              Cached(CacheTime.NotFound)(
                RevalidatableResult.apply(Results.InternalServerError(message), message),
              )
            }
          }
          case Right(newsletter) => newsletterDetailPageResult(newsletter)
        }
      }
    }

  def renderNewsletterDetailJson(identityName: String)(implicit
      executionContext: ExecutionContext = this.executionContext,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        getNewsletterIfLive(identityName) match {
          case Left(message) => {
            if (message == "not found") {
              Cached(CacheTime.NotFound)(Cached.WithoutRevalidationResult(NotFound))
            } else {
              Cached(CacheTime.NotFound)(
                RevalidatableResult.apply(Results.InternalServerError(message), message),
              )
            }
          }
          case Right(newsletter) => newsletterDetailJsonResult(newsletter)
        }
      }
    }
}
