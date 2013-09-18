package common

import play.api.templates.Html
import play.api.mvc.RequestHeader
import conf.Configuration

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
    case AbsoluteGuardianUrl(path) =>  urlFor(path, edition)
    case AbsolutePath(path) => urlFor(path, edition)
    case otherUrl => otherUrl
  }).trim

  private def urlFor(path: String, edition: Edition) = s"$host/${Editionalise(path, edition)}"

}

object LinkTo extends LinkTo

