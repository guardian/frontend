package commercial

import scala.concurrent.future
import tools.Store
import implicits.Dates
import com.ning.http.util.AsyncHttpProviderUtils
import model.diagnostics.CloudWatch
import common.{ExecutionContexts, Logging}
import play.api.libs.ws.{Response, WS}
import scala.concurrent.Future
import conf.Configuration.commercial._

object TravelOffersCacheJob extends ExecutionContexts with Dates with Logging {

  protected val url = traveloffers_url
  // following RFC-2616#3.7.1
  protected val characterEncoding: String = AsyncHttpProviderUtils.DEFAULT_CHARSET

  protected val loadTimeout: Int = 20000

  protected val adTypeName = "Travel Offers"

  private def recordLoad(duration: Long) {
    val feedName = adTypeName.toLowerCase.replaceAll("\\s+", "-")
    val key = s"$feedName-feed-load-time"
    CloudWatch.put("Commercial", Map(s"$key" -> duration.toDouble))
  }


  def run() {
    future {
      url map {u =>
        val start = System.currentTimeMillis

        // Go grab the thing
        val future: Future[Response] = WS.url(u) withRequestTimeout loadTimeout get()

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
