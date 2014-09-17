package model.commercial

import com.ning.http.client.{Response => AHCResponse}
import com.ning.http.util.AsyncHttpProviderUtils
import common.{ExecutionContexts, Logging}
import conf.Switch
import model.diagnostics.CloudWatch
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws._

import scala.concurrent.Future
import scala.xml.{Elem, XML}

trait AdsApi[F, T <: Ad] extends ExecutionContexts with Logging {

  import play.api.Play.current

  protected val switch: Switch

  protected val adTypeName: String

  protected def url: Option[String]

  // following RFC-2616#3.7.1
  protected val characterEncoding: String = AsyncHttpProviderUtils.DEFAULT_CHARSET

  protected val loadTimeout: Int = 2000

  protected def transform(body: String): F

  def parse(feed: F): Seq[T]

  private def recordLoad(duration: Long) {
    val feedName = adTypeName.toLowerCase.replaceAll("\\s+", "-")
    val key = s"$feedName-feed-load-time"
    CloudWatch.put("Commercial", Map(s"$key" -> duration.toDouble))
  }

  def loadAds(): Future[Seq[T]] = doIfSwitchedOn {
    url map { u =>

      def extractAds(response: WSResponse): Seq[T] = {
        val body = {
          // look at documentation of response.body to see why this is necessary
          if (characterEncoding == AsyncHttpProviderUtils.DEFAULT_CHARSET)
            response.body
          else
            response.underlying[AHCResponse].getResponseBody(characterEncoding)
        }

        val feed = transform(body)
        parse(feed)
      }

      val start = System.currentTimeMillis

      val futureResponse = WS.url(u) withRequestTimeout loadTimeout get()

      futureResponse onFailure {
        case e: Exception =>
          log.error(s"Loading $adTypeName ads from $u failed: ${e.getMessage}")
          recordLoad(-1)
      }

      futureResponse map { response =>
        if (response.status == 200) {
          recordLoad(System.currentTimeMillis - start)
          val ads = extractAds(response)
          log.info(s"Loaded ${ads.size} $adTypeName from $u")
          ads
        } else {
          log.error(s"Loading $adTypeName ads from $u failed: status ${response.status} [${response.statusText}]")
          recordLoad(-1)
          Nil
        }
      }

    } getOrElse {
      log.warn(s"Missing $adTypeName URL")
      Future(Nil)
    }
  }

  def doIfSwitchedOn(action: => Future[Seq[T]]): Future[Seq[T]] = {
    if (switch.isSwitchedOn) {
      action
    } else {
      log.warn(s"Feed for $adTypeName switched off")
      Future(Nil)
    }
  }
}

trait JsonAdsApi[T <: Ad] extends AdsApi[JsValue, T] {

  final def transform(body: String): JsValue = Json.parse(body)

  def parse(json: JsValue): Seq[T]
}
