package views.support

import org.jsoup.nodes.{Document, Element}

import scala.collection.JavaConversions._

object FormStackCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val formStackHost: String = "guardiannewsampampmedia.formstack.com"

    document.getElementsByAttributeValueContaining("src", formStackHost).foreach { elem: Element =>
      elem.addClass("element-formstack")
    }

    document
  }
}
