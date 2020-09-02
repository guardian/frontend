package controllers

import common.{ImplicitControllerExecutionContext, LinkTo, Logging}
import common.`package`._
import _root_.commercial.campaigns.ShortCampaignCodes
import contentapi.ContentApiClient
import model.{ApplicationContext, Cached}
import play.api.mvc._

import scala.concurrent.Future

class ShortUrlsController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Logging
    with ImplicitControllerExecutionContext {

  def redirectShortUrl(shortUrl: String): Action[AnyContent] =
    Action.async { implicit request =>
      redirectUrl(shortUrl, request.queryString)
    }

  private def redirectUrl(shortUrl: String, queryString: Map[String, Seq[String]])(implicit
      request: RequestHeader,
  ): Future[Result] = {
    contentApiClient
      .getResponse(contentApiClient.item(shortUrl))
      .map { response =>
        response.content
          .map(_.id)
          .map { id =>
            Redirect(LinkTo(s"/$id"), queryString = queryString, status = MOVED_PERMANENTLY)
          }
          .getOrElse(NotFound)
      }
      .recover(convertApiExceptionsWithoutEither)
      .map(Cached.explicitlyCache(1800))
  }

  def fetchCampaignAndRedirectShortCode(shortUrl: String, campaignCode: String): Action[AnyContent] =
    Action.async { implicit request =>
      val queryString = request.queryString ++ ShortCampaignCodes.makeQueryParameter(campaignCode)
      redirectUrl(shortUrl, queryString)
    }
}
