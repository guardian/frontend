package common

import org.apache.commons.lang.StringEscapeUtils
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import scala.collection.JavaConverters._

object HTML {
  def noHtml(headline: String): String = StringEscapeUtils.unescapeHtml(Jsoup.clean(headline, Whitelist.none()))

  def takeFirstNElements(html: String, n: Int): String =
    Jsoup
      .parse(html)
      .select("body")
      .iterator
      .asScala
      .toList
      .flatMap(_.children().asScala.take(n))
      .map(_.toString)
      .mkString("")
}
