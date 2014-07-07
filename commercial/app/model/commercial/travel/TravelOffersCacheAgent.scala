package model.commercial.travel

import common.{ExecutionContexts, Logging}
import play.api.libs.ws.{Response, WS}
import scala.concurrent.Future
import conf.CommercialConfiguration._
import services.S3
import conf.{Switches, CommercialConfiguration}
import model.diagnostics.CloudWatch
import com.ning.http.util.AsyncHttpProviderUtils

object TravelOffersCacheAgent extends Logging with ExecutionContexts {
  protected val url = CommercialConfiguration.getProperty("traveloffers.api.url") map (u => s"$u/consumerfeed")

  protected val switch = Switches.TravelOffersFeedSwitch

  // following RFC-2616#3.7.1
  protected val characterEncoding: String = AsyncHttpProviderUtils.DEFAULT_CHARSET

  protected val loadTimeout: Int = 20000

  protected val adTypeName = "Travel Offers"

  private def recordLoad(duration: Long) {
    val feedName = adTypeName.toLowerCase.replaceAll("\\s+", "-")
    val key = s"$feedName-feed-load-time"
    CloudWatch.put("Commercial", Map(s"$key" -> duration.toDouble))
  }

  def refresh() = if (switch.isSwitchedOn) {
    url foreach {u =>
      val start = System.currentTimeMillis

      // Go grab the thing
      val future: Future[Response] = WS.url(u) withRequestTimeout loadTimeout get()

      future onSuccess {
        case response =>
          log.info(s"Loaded Travel Offers from $u")
          recordLoad(System.currentTimeMillis - start)

          S3.putPublic(travelOffersS3Key, response.body, "application/json;charset=utf-8")
      }
      future onFailure {
        case e: Exception =>
          log.error(s"Loading Travel Offers from $u failed: ${e.getMessage}")
          recordLoad(-1)
      }
    }
  }

}
