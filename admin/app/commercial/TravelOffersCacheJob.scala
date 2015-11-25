package commercial

import com.ning.http.util.AsyncHttpProviderUtils
import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial._
import implicits.Dates
import model.diagnostics.CloudWatch
import play.api.Play.current
import play.api.libs.ws.{WS, WSResponse}
import tools.Store

import scala.concurrent.{Future, future}

object TravelOffersCacheJob extends ExecutionContexts with Dates with Logging {

  protected val url = traveloffers_url

  protected val loadTimeout: Int = 60000

  protected val adTypeName = "Travel Offers"

  private def recordLoad(duration: Long) {
    val feedName = adTypeName.toLowerCase.replaceAll("\\s+", "-")
    val key = s"$feedName-feed-load-time"
    CloudWatch.put("Commercial", Map(s"$key" -> duration.toDouble))
  }


  def run() {
    Future {
      url map {u =>
        val start = System.currentTimeMillis

        // Go grab the thing
        val future: Future[WSResponse] = WS.url(u) withRequestTimeout loadTimeout get()

        future onSuccess {
          case response =>
            val status = response.status
            if (status == 200) {
              log.info(s"Successfully loaded Travel Offers from $u")
              recordLoad(System.currentTimeMillis - start)

              Store.putCachedTravelOffersFeed(response.body)
            } else {
              log.error(s"Error loading Travel Offers from $u, response code is $status")
              recordLoad(-1)
            }
        }
        future onFailure {
          case e: Exception =>
            log.error(s"Error loading Travel Offers from $u: ${e.getMessage}")
            recordLoad(-1)
        }
      }
    }
  }
}
