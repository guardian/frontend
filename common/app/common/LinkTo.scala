package common

import conf.Configuration
import layout.ContentCard
import model.Trail
import org.jsoup.Jsoup
import play.api.mvc.{AnyContent, Request, RequestHeader, Result}
import play.twirl.api.Html
import scala.jdk.CollectionConverters._

/*
 * Builds absolute links to the core site (www.theguardian.com)
 */
trait LinkTo extends GuLogging {

  lazy val host = Configuration.site.host

  private val GuardianUrl = "^(http[s]?://www.theguardian.com)?(/.*)?$".r
  private val RssPath = "^(/.+)?(/rss)".r
  private val TagPattern = """^([\w\d-]+)/([\w\d-]+)$""".r

  def apply(html: Html)(implicit request: RequestHeader): String = this(html.toString(), Edition(request))
  def apply(link: String)(implicit request: RequestHeader): String = this(link, Edition(request))

  def apply(url: String, edition: Edition): String =
    processUrl(url.trim, edition).url

  def apply(trail: Trail)(implicit request: RequestHeader): Option[String] = Option(apply(trail.metadata.url))

  def apply(faciaCard: ContentCard)(implicit request: RequestHeader): String =
    faciaCard.header.url.get(request)

  case class ProcessedUrl(url: String, shouldNoFollow: Boolean = false)

  def processUrl(url: String, edition: Edition): ProcessedUrl =
    url match {
      case `url` if url.startsWith("//") => ProcessedUrl(url)
      case RssPath(path, format)         => ProcessedUrl(urlFor(path, edition) + format)
      case GuardianUrl(_, path)          => ProcessedUrl(urlFor(path, edition))
      case otherUrl                      => ProcessedUrl(otherUrl, shouldNoFollow = true)
    }

  private def urlFor(path: String, edition: Edition): String = {
    val pathString = Option(path).getOrElse("")
    val id = if (pathString.startsWith("/")) pathString.substring(1) else pathString
    val editionalisedPath = Editionalise(clean(id), edition)

    s"$host/$editionalisedPath"
  }

  private def clean(path: String) =
    path match {
      case TagPattern(left, right) if left == right => left //clean section tags e.g. /books/books
      case _                                        => path
    }

  def redirectWithParameters(request: Request[AnyContent], realPath: String): Result = {
    val params = if (request.hasParameters) s"?${request.rawQueryString}" else ""
    Redirect(if (request.path.endsWith(".json")) {
      s"/$realPath.json$params"
    } else {
      s"/$realPath$params"
    })
  }
}

case class LinkCounts(internal: Int, external: Int) {
  def +(that: LinkCounts): LinkCounts = LinkCounts(this.internal + that.internal, this.external + that.external)
  lazy val noLinks = internal == 0 && external == 0
}

object LinkCounts {
  val None = LinkCounts(0, 0)
}

object LinkTo extends LinkTo {

  // we can assume www.theguardian.com here as this happens before any cleaning
  def countLinks(html: String): LinkCounts = {
    val links = Jsoup.parseBodyFragment(html).getElementsByTag("a").asScala.flatMap(a => Option(a.attr("href")))
    val guardianLinksCount = links.count(_ contains "www.theguardian.com")
    LinkCounts(
      internal = guardianLinksCount,
      external = links.length - guardianLinksCount,
    )
  }

}

/**
  * represents the link rel=canonical for any page on the site
  */
class CanonicalLink {

  val significantParams: Seq[String] = Seq(
    "index",
    "page",
    "filterKeyEvents",
    "topics",
  )

  def apply(implicit request: RequestHeader, webUrl: String): String = {
    val queryString = {
      val q = significantParams
        .flatMap(key => request.getQueryString(key).map(value => s"$key=${value.urlEncoded}"))
        .sorted
        .mkString("&")
      if (q.isEmpty) "" else s"?$q"
    }
    s"$webUrl$queryString"
  }
}

object CanonicalLink extends CanonicalLink

object AnalyticsHost extends implicits.Requests {
  // safest to always use secure host as we avoid mixed content if we fail to detect https
  def apply(): String = "https://hits-secure.theguardian.com"
}

trait AmpLinkTo extends LinkTo {
  override lazy val host = Configuration.amp.baseUrl

  def pvBeaconUrl(implicit request: RequestHeader): String = {
    val beaconHost = Configuration.debug.beaconUrl
    val isLocalBeacon = beaconHost.isEmpty
    val path = "count/pv.gif"
    if (isLocalBeacon) s"//${request.host}/$path" else s"$beaconHost/$path"
  }
}

object AmpLinkTo extends AmpLinkTo {

  override def processUrl(url: String, edition: Edition): ProcessedUrl = {
    val ampUrl = if (host.isEmpty) s"$url?amp=1" else url
    super.processUrl(ampUrl, edition)
  }
}
