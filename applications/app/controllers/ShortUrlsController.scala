package controllers

import common.{ExecutionContexts, LinkTo, Logging}
import common.`package`._
import campaigns.ShortCampaignCodes
import contentapi.ContentApiClient
import model.Cached
import play.api.mvc.{RequestHeader, Action, Controller}

object ShortUrlsController extends Controller with Logging with ExecutionContexts {

  def redirectShortUrl(shortUrl: String) = Action.async { implicit request =>
    log.info(s"Redirecting short url $shortUrl")
    redirectUrl(shortUrl, request.queryString)
  }

  private def redirectUrl(shortUrl: String, queryString: Map[String, Seq[String]])(implicit request: RequestHeader) = {
    ContentApiClient.getResponse(ContentApiClient.item(shortUrl)).map { response =>
      response.content.map(_.id).map { id =>
        Redirect(LinkTo(s"/$id"), queryString = queryString, status = MOVED_PERMANENTLY)
      }.getOrElse(NotFound)
    }.recover(convertApiExceptionsWithoutEither).map(Cached.explicitlyCache(1800))
  }

  def fetchCampaignAndRedirectShortCode(shortUrl: String, campaignCode: String) = Action.async { implicit request =>
    log.info(s"Fetching campaign for $campaignCode and redirect short url")
    val queryString = request.queryString ++ ShortCampaignCodes.makeQueryParameter(campaignCode)
    redirectUrl(shortUrl, queryString)
  }
}
