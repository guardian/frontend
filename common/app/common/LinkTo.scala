package common

import play.api.templates.Html
import play.api.mvc.{SimpleResult, AnyContent, Request, RequestHeader}
import conf.Configuration
import model.MetaData
import org.jsoup.Jsoup
import scala.collection.JavaConversions._

/*
 * Builds absolute links to the core site (www.theguardian.com)
 */
trait LinkTo extends Logging {

  lazy val host = Configuration.site.host

  private val AbsoluteGuardianUrl = "^http://www.theguardian.com/(.*)$".r
  private val AbsolutePath = "^/(.+)".r

  def apply(html: Html)(implicit request: RequestHeader): String = this(html.toString(), Edition(request))
  def apply(link: String)(implicit request: RequestHeader): String = this(link, Edition(request))

  def apply(url: String, edition: Edition): String = (url match {
    case "http://www.theguardian.com" => urlFor("", edition)
    case "/" => urlFor("", edition)
    case protocolRelative if protocolRelative.startsWith("//") => protocolRelative
    case AbsoluteGuardianUrl(path) =>  urlFor(path, edition)
    case AbsolutePath(path) => urlFor(path, edition)
    case otherUrl => otherUrl
  }).trim

  private def urlFor(path: String, edition: Edition) = s"$host/${Editionalise(path, edition)}"

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

object DesktopLink {

  import java.net.URLEncoder.encode

  def apply(page: MetaData)(implicit request: RequestHeader) = {
    val targetUrl = encode(s"${LinkTo(s"/${page.id}")}?view=desktop", "UTF-8")
    s"${LinkTo{"/preference/platform/desktop"}}?page=$targetUrl"
  }
}

