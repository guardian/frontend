package model.commercial

import com.ning.http.util.AsyncHttpProviderUtils
import common.{ExecutionContexts, Logging}
import conf.Switch
import model.diagnostics.CloudWatch
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WS
import com.ning.http.client.{ Response => AHCResponse}

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
    url map {
      u =>
        val start = System.currentTimeMillis
        val fads = WS.url(u) withRequestTimeout loadTimeout get() map {
          response => {
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
        }

        fads onSuccess {
          case ads =>
            log.info(s"Loaded ${ads.size} $adTypeName from $u")
            recordLoad(System.currentTimeMillis - start)
        }
        fads onFailure {
          case e: Exception =>
            log.error(s"Loading $adTypeName ads from $u failed: ${e.getMessage}")
            recordLoad(-1)
        }

        fads

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

trait XmlAdsApi[T <: Ad] extends AdsApi[Elem, T] {

  protected def cleanResponseBody(body: String): String = body

  final def transform(body: String): Elem = XML.loadString(cleanResponseBody(body))

  def parse(xml: Elem): Seq[T]
}
