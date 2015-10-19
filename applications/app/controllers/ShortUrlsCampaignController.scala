package controllers

import common.{LinkTo, Logging}
import common.`package`._
import conf.LiveContentApi
import model.Cached
import play.api.mvc.{RequestHeader, Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global

object ShortUrlsCampaignController extends Controller with Logging {

  val campaigns = Map (
    "iw" -> "twt_ipd",
    "wc" -> "twt_wc",
    "tf" -> "twt_fd",
    "fb" -> "fb_gu",
    "fo" -> "fb_ot",
    "us" -> "fb_us",
    "au" -> "soc_567",
    "tw" -> "twt_gu",
    "at" -> "twt_atn",
    "sfb"-> "share_btn_fb",
    "ip" -> "twt_iph",
    "stw" -> "share_btn_tw",
    "swa" -> "share_btn_wa",
    "em" -> "email",
    "sgp" -> "share_btn_gp",
    "sbl" -> "share_btn_link"
  )

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
    val queryString = request.queryString ++ campaigns.get(campaignCode).map(code => ("CMP", Seq(code)))
    redirectUrl(shortUrl, queryString)
  }
}
