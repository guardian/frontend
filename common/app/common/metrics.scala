package common

import play.api.mvc.{ Content => UnWanted, _ }
import com.gu.management.{ CountMetric, TimingMetric }
import play.api.templates.Html
import org.scala_tools.time.Imports._
import org.joda.time.format.DateTimeFormatter

object RequestTimingMetric extends TimingMetric("performance", "requests", "Client requests",
  "incoming requests to the application")

object ContentApiHttpTimingmetric extends TimingMetric("performance", "content-api-calls", "Content API calls",
  "outgoing requests to content api", Some(RequestTimingMetric))

object Request200s extends CountMetric("request-status", "200_ok", "200 Ok", "number of pages that responded 200")

object Request50xs extends CountMetric("request-status", "50x_error", "50x Error", "number of pages that responded 50x")

object Request404s extends CountMetric("request-status", "404_not_found", "404 Not found", "number of pages that responded 404")

object Request30xs extends CountMetric("request-status", "30x_redirect", "30x Redirect", "number of pages that responded with a redirect")

object RequestOther extends CountMetric("request-status", "other", "Other", "number of pages that responded with an unexpected status code")

object CommonMetrics {
  lazy val all = Seq(
    ContentApiHttpTimingmetric,
    RequestTimingMetric,
    Request200s,
    Request50xs,
    Request404s,
    RequestOther,
    Request30xs)
}

object CachedOk extends Results {
  val lastModifiedFormatter = DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss zzz")

  def apply(metaData: MetaData)(block: Html): Result = {
    Ok(block).withHeaders(cacheStrategyFor(metaData): _*)
  }

  private def cacheStrategyFor(metaData: MetaData): Seq[(String, String)] = metaData match {
    case c: Content if c.isLive => cacheForSecondsWithLastModified(10, c)
    case c: Content if c.lastModified > DateTime.now - 24.hours => cacheForSecondsWithLastModified(60, c)
    case c: Content => cacheForSecondsWithLastModified(900, c) //15 minutes

    case _ => Seq(("Cache-Control", "public, max-age=60"))
  }

  def cacheForSecondsWithLastModified(seconds: Int, content: Content) = Seq(
    ("Cache-Control" -> "public, max-age=%s".format(seconds)),
    ("Last-Modified" -> content.lastModified.toString(lastModifiedFormatter))
  )

}

