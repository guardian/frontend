package model.commercial

import scala.concurrent.Future
import play.api.libs.json.JsValue
import play.api.libs.ws.WS
import common.{ExecutionContexts, Logging}
import scala.xml.{XML, Elem}

trait AdsApi {

  protected val adTypeName: String

  protected val loadTimeout: Int = 2000
}

trait JsonAdsApi[T <: Ad] extends AdsApi with ExecutionContexts with Logging {

  def parse(json: JsValue): Seq[T]

  def loadAds(url: => Option[String]): Future[Seq[T]] = {
    url map {
      u =>
        val fads = WS.url(u) withRequestTimeout loadTimeout get() map {
          response => {
            val json = response.json
            parse(json)
          }
        }

        fads onSuccess {
          case ads => log.info(s"Loaded ${ads.size} $adTypeName from $u")
        }
        fads onFailure {
          case e: Exception => log.error(s"Loading $adTypeName ads from $u failed: ${e.getMessage}")
        }

        fads

    } getOrElse {
      log.warn(s"Missing $adTypeName URL")
      Future(Nil)
    }
  }
}

trait XmlAdsApi[T <: Ad] extends AdsApi with ExecutionContexts with Logging {

  def cleanResponseBody(body: String): String = body

  def parse(xml: Elem): Seq[T]

  def loadAds(url: => Option[String]): Future[Seq[T]] = {
    url map {
      u =>
        val fads = WS.url(u) withRequestTimeout loadTimeout get() map {
          response => {
            val xml = XML.loadString(cleanResponseBody(response.body))
            parse(xml)
          }
        }

        fads onSuccess {
          case ads => log.info(s"Loaded ${ads.size} $adTypeName from $u")
        }
        fads onFailure {
          case e: Exception => log.error(s"Loading $adTypeName ads from $u failed: ${e.getMessage}")
        }

        fads

    } getOrElse {
      log.warn(s"Missing $adTypeName URL")
      Future(Nil)
    }
  }
}
