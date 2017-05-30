package common

import org.apache.commons.lang.StringEscapeUtils
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import scala.collection.JavaConversions._


object HTML {
  def noHtml(headline: String): String = StringEscapeUtils.unescapeHtml(Jsoup.clean(headline, Whitelist.none()))

  def takeFirstNElements(html: String, n: Int): String =
    Jsoup.parse(html)
      .select("body")
      .iterator
      .toList
      .flatMap(_.children().take(n))
      .map(_.toString)
      .mkString("")
}
