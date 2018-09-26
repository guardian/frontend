package html

import java.net.URL
import common.Logging
import org.jsoup.Jsoup
import org.jsoup.nodes._
import play.twirl.api.Html
import scala.collection.JavaConverters._
import scala.util.Try

object HtmlLinkUtmInsertion extends Logging {

  def apply(html: Html): Html = {
    val documentBody = Jsoup.parse(html.toString)
    Html(setLinks(documentBody).toString)
  }

  private def setLinks(element: Element): Element = {
    Option(element.attr("href"))
      .collect { case url if url.nonEmpty && element.nodeName() == "a" =>
        val startQuery = Try(new URL(url))
          .toOption
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
