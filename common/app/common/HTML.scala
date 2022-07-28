package common

import org.apache.commons.lang.StringEscapeUtils
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist

object HTML {
  def noHtml(headline: String): String = StringEscapeUtils.unescapeHtml(Jsoup.clean(headline, Whitelist.none()))
}
