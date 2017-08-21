package views.support.cleaner

import org.apache.commons.lang.StringEscapeUtils
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import views.support.HtmlCleaner

object StringCleaner {

  implicit class DocumentString(html: String) {
    def cleanWith(cleaner: HtmlCleaner): Document = {
      // The format we are using for the test data - while eminently readable - is treated as XML when toString() is run on it.
      // To parse it into a JSoup element, it is necessary to remove all the XML character encodings that have been introduced.
      val document = Jsoup.parse(StringEscapeUtils.unescapeXml(html))
      cleaner.clean(document)
      document
    }
  }

}
