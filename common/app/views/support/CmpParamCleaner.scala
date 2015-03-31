package views.support

import org.jsoup.nodes.{Document, Element}

import scala.collection.JavaConversions._

object CmpParamCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val formstackSrcValues = List("guardiannewsampampmedia.formstack.com",  // straight from Formstack
                                  "profile.theguardian.com/form/embed")     // Guardian embed wrapper

    for (url <- formstackSrcValues) {
      document.getElementsByAttributeValueContaining("src", url).foreach { elem: Element =>
        elem.addClass("element-pass-cmp")
      }
    }

    document
  }
}
