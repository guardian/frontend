package common

import common.editions.{Au, Us, Uk}
import conf.Configuration
import conf.switches.Switches
import implicits.Requests
import layout.ContentCard
import model.Trail
import org.jsoup.Jsoup
import play.api.mvc.{AnyContent, Request, RequestHeader, Result}
import play.twirl.api.Html

import scala.collection.JavaConversions._

/*
 * Builds absolute links to the core site (www.theguardian.com)
 */
trait LinkTo extends Logging {

  lazy val host = Configuration.site.host

  private val ProdURL = "^http://www.theguardian.com/.*$".r
  private val GuardianUrl = "^(http://www.theguardian.com)?(/.*)?$".r
  private val RssPath = "^(/.+)?(/rss)".r
  private val AmpPath = s"^(/.+)(${Requests.AMP_SUFFIX})$$".r
  private val TagPattern = """^([\w\d-]+)/([\w\d-]+)$""".r

  val httpsEnabledSections: Seq[String] = Seq("info")

  def apply(html: Html)(implicit request: RequestHeader): String = this(html.toString(), Edition(request))
  def apply(link: String)(implicit request: RequestHeader): String = this(link, Edition(request))

  def apply(url: String, edition: Edition)(implicit request: RequestHeader): String =
    processUrl(url.trim, edition).url

  def apply(trail: Trail)(implicit request: RequestHeader): Option[String] = Option(apply(trail.metadata.url))

  def apply(faciaCard: ContentCard)(implicit request: RequestHeader): String =
    faciaCard.header.url.get(request)

  case class ProcessedUrl(url: String, shouldNoFollow: Boolean = false)

  def processUrl(url: String, edition: Edition) = url match {
    case url if url.startsWith("//") =>
      ProcessedUrl(url)
    case RssPath(path, format) =>
      ProcessedUrl(urlFor(path, edition) + format)
    case AmpPath(path, format) =>
      ProcessedUrl(urlFor(path, edition, secure = true) + format)
    case GuardianUrl(_, path) =>
      ProcessedUrl(urlFor(path, edition))
    case otherUrl =>
      ProcessedUrl(otherUrl, true)
  }

  private def urlFor(path: String, edition: Edition, secure: Boolean = false): String = {
    val pathString = Option(path).getOrElse("")
    val id = if (pathString.startsWith("/")) pathString.substring(1) else pathString
    val editionalisedPath = Editionalise(clean(id), edition)
    val url = s"$host/$editionalisedPath"
    url match {
      case ProdURL() if (isHttpsEnabled(editionalisedPath) || secure) =>  url.replace("http://", "https://")
      case _ => url
    }
  }

  private def isHttpsEnabled(editionalisedPath: String) =
    httpsEnabledSections.exists(editionalisedPath.startsWith)

  private def clean(path: String) = path match {
    case TagPattern(left, right) if left == right => left //clean section tags e.g. /books/books
    case _ => path
  }

  def redirectWithParameters(request: Request[AnyContent], realPath: String): Result = {
    val params = if (request.hasParameters) s"?${request.rawQueryString}" else ""
    Redirect(request.path.endsWith(".json") match {
      case true => s"/$realPath.json$params"
      case _ => s"/$realPath$params"
    })
  }
}

case class LinkCounts(internal: Int, external: Int) {
  def + (that: LinkCounts): LinkCounts = LinkCounts(this.internal + that.internal, this.external + that.external)
  lazy val noLinks = internal == 0 && external == 0
}

object LinkCounts {
  val None = LinkCounts(0, 0)
}

object LinkTo extends LinkTo {

  // we can assume www.theguardian.com here as this happens before any cleaning
  def countLinks(html: String): LinkCounts = {
    val links = Jsoup.parseBodyFragment(html).getElementsByTag("a").flatMap(a => Option(a.attr("href")))
    val guardianLinksCount = links.count(_ contains "www.theguardian.com")
    LinkCounts(
      internal = guardianLinksCount,
      external = links.length - guardianLinksCount
    )
  }

}

/**
 * represents the link rel=canonical for any page on the site
 */
class CanonicalLink {

  val significantParams: Seq[String] = Seq(
    "index",
    "page"
  )

  def apply(implicit request: RequestHeader, webUrl: String): String = {
    val queryString = {
      val q = significantParams.flatMap(key => request.getQueryString(key).map(value => s"$key=${value.urlEncoded}"))
        .sorted.mkString("&")
      if (q.isEmpty) "" else s"?$q"
    }
    s"$webUrl$queryString"
  }
}

object CanonicalLink extends CanonicalLink

object AnalyticsHost extends implicits.Requests {
  def apply()(implicit request: RequestHeader): String =
    if (Switches.SecureOmniture.isSwitchedOn ||
      request.headers.get("X-Forwarded-Proto").exists(_.equalsIgnoreCase("https"))) {
      "https://hits-secure.theguardian.com"
    } else {
      "http://hits.theguardian.com"
    }
}

object SubscribeLink {
  private val subscribeEditions = Map(
    Us -> "us",
    Au -> "au"
  )

  private def subscribeLink(edition: Edition) = subscribeEditions.getOrDefault(edition, "")

  def apply(edition: Edition): String = s"https://subscribe.theguardian.com/${subscribeLink(edition)}?INTCMP=NGW_HEADER_${edition.id}_GU_SUBSCRIBE"
}

