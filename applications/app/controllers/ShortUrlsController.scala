package controllers

import common.{ExecutionContexts, LinkTo, Logging}
import common.`package`._
import campaigns.ShortCampaignCodes
import contentapi.ContentApiClient
import model.{ApplicationContext, Cached}
import play.api.mvc.{Action, Controller, RequestHeader}

class ShortUrlsController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  def redirectShortUrl(shortUrl: String) = Action.async { implicit request =>
    redirectUrl(shortUrl, request.queryString)
  }

  private def redirectUrl(shortUrl: String, queryString: Map[String, Seq[String]])(implicit request: RequestHeader) = {
    contentApiClient.getResponse(contentApiClient.item(shortUrl)).map { response =>
      response.content.map(_.id).map { id =>
        Redirect(LinkTo(s"/$id"), queryString = queryString, status = MOVED_PERMANENTLY)
      }.getOrElse(NotFound)
    }.recover(convertApiExceptionsWithoutEither).map(Cached.explicitlyCache(1800))
  }

  def fetchCampaignAndRedirectShortCode(shortUrl: String, campaignCode: String) = Action.async { implicit request =>
    val queryString = request.queryString ++ ShortCampaignCodes.makeQueryParameter(campaignCode)
    redirectUrl(shortUrl, queryString)
  }
}
