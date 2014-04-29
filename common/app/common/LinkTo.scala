package common

import play.api.templates.Html
import play.api.mvc.{SimpleResult, AnyContent, Request, RequestHeader}
import conf.Configuration
import model.{Snap, Trail, MetaData}
import org.jsoup.Jsoup
import scala.collection.JavaConversions._

/*
 * Builds absolute links to the core site (www.theguardian.com)
 */
trait LinkTo extends Logging {

  lazy val host = Configuration.site.host

  private val AbsoluteGuardianUrl = "^http://www.theguardian.com/(.*)$".r
  private val AbsolutePath = "^/(.+)".r
  private val RssPath = "^/(.+)(/rss)".r

  def apply(html: Html)(implicit request: RequestHeader): String = this(html.toString(), Edition(request), Region(request))
  def apply(link: String)(implicit request: RequestHeader): String = this(link, Edition(request), Region(request))

  def apply(url: String, edition: Edition, region: Option[Region] = None): String = (url match {
    case "http://www.theguardian.com" => homeLink(edition, region)
    case "/" => homeLink(edition, region)
    case protocolRelative if protocolRelative.startsWith("//") => protocolRelative
    case AbsoluteGuardianUrl(path) =>  urlFor(path, edition)
    case "/rss" => urlFor("", edition) + "/rss"
    case RssPath(path, format) => urlFor(path, edition) + "/rss"
    case AbsolutePath(path) => urlFor(path, edition)
    case otherUrl => otherUrl
  }).trim

  def apply(trail: Trail)(implicit request: RequestHeader): Option[String] = trail match {
    case snap: Snap => snap.snapUrl.filter(_.nonEmpty)
    case t: Trail => Option(apply(t.url))
  }

  private def urlFor(path: String, edition: Edition) = s"$host/${Editionalise(path, edition)}"

  private def homeLink(edition: Edition, region: Option[Region]) = region.map(_.id.toLowerCase)
    .map(urlFor(_, edition))
    .getOrElse(urlFor("", edition))

  def redirectWithParameters(request: Request[AnyContent], realPath: String): SimpleResult = {
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

object ClassicLink {

  import java.net.URLEncoder.encode

  def apply(page: MetaData)(implicit request: RequestHeader) = {

    // quick fix for xx-alpha bug
    val fixedId = page.id match {
      case "uk-alpha" => "uk"
      case "au-alpha" => "au"
      case "us-alpha" => "us"
      case id => id
    }

    val targetUrl = encode(s"${LinkTo(s"/$fixedId")}?view=classic", "UTF-8")
    s"${LinkTo{"/preference/platform/classic"}}?page=$targetUrl"
  }

  // As we move towards taking over full site traffic, we will get pages that only work on the Next Gen platform.
  // add whatever identifies them here so that we do not show users a 'Classic' link on those pages
  def hasClassicVersion()(implicit request: RequestHeader): Boolean = !specialLiveBlog(request)

  private def specialLiveBlog(request: RequestHeader) = request.path.contains("-sp-")
}

