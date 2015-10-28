package controllers

import common.{ExecutionContexts, LinkTo, Logging}
import common.`package`._
import campaigns.ShortCampaignCodes
import conf.LiveContentApi
import model.Cached
import play.api.mvc.{RequestHeader, Action, Controller}

object ShortUrlsCampaignController extends Controller with Logging with ExecutionContexts {

  def redirectShortUrl(shortUrl: String) = Action.async { implicit request =>
    log.info(s"Redirecting short url $shortUrl")
    redirectUrl(shortUrl, request.queryString)
  }

  private def redirectUrl(shortUrl: String, queryString: Map[String, Seq[String]])(implicit request: RequestHeader) = {
    LiveContentApi.getResponse(LiveContentApi.item(shortUrl)).map { response =>
      response.content.map(_.id).map { id =>
        Redirect(LinkTo(s"/$id"), queryString)
      }.getOrElse(NotFound)
    }.recover(convertApiExceptionsWithoutEither).map(Cached(60))
  }

  def fetchCampaignAndRedirectShortCode(shortUrl: String, campaignCode: String) = Action.async { implicit request =>
    log.info(s"Fetching campaign for $campaignCode and redirect short url")
    val queryString = request.queryString ++ ShortCampaignCodes.makeQueryParameter(campaignCode)
    redirectUrl(shortUrl, queryString)
  }
}
