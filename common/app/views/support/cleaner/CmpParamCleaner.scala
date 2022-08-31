package views.support.cleaner

import org.jsoup.nodes.{Document, Element}
import views.support.HtmlCleaner

import scala.jdk.CollectionConverters._

object CmpParamCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val formstackSrcValues = List(
      "guardiannewsampampmedia.formstack.com", // straight from Formstack
      "profile.theguardian.com/form/embed",
    ) // Guardian embed wrapper

    for (url <- formstackSrcValues) {
      document.getElementsByAttributeValueContaining("src", url).asScala.foreach { elem: Element =>
        elem.addClass("element-pass-cmp")
      }
    }

    document
  }
}
