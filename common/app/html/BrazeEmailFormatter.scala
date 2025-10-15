package html

import java.net.{URI, URL}
import common.GuLogging
import model.EmailAddons
import org.jsoup.Jsoup
import org.jsoup.nodes._
import play.twirl.api.Html

import scala.jdk.CollectionConverters._
import scala.util.Try

object BrazeEmailFormatter extends GuLogging {

  def apply(html: Html): Html = {
    val documentBody = Jsoup.parse(html.toString)
    Html(trimWhitespace(setLinks(documentBody).toString))
  }

  private def trimWhitespace(html: String): String = {
    "(?m) *$".r.replaceAllIn("(?m)^ *".r.replaceAllIn(html, ""), "")
  }

  private def setLinks(element: Element): Element = {
    Option(element.attr("href"))
      .collect {
        case url if url.nonEmpty && element.nodeName() == "a" && !url.contains(EmailAddons.unsubscribePlaceholder) =>
          val startQuery = Try(new URI(url).toURL).toOption
            .flatMap(uri => Option(uri.getQuery))
            .fold("?")(_ => "&")
          s"$url$startQuery##braze_utm##"
      }
      .foreach { newHref =>
        element.attr("href", newHref)
      }

    element.children().asScala.foreach(setLinks)
    element
  }
}
