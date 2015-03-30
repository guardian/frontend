package views.support

import org.jsoup.nodes.{Document, Element}

import scala.collection.JavaConversions._

object CmpParamCleaner extends HtmlCleaner {
  override def clean(document: Document): Document = {
    val formStackHost: String = "guardiannewsampampmedia.formstack.com"
    val profileFormstackWrapper: String = "profile.theguardian.com/form/embed"

    document.getElementsByAttributeValueContaining("src", formStackHost).foreach { elem: Element =>
      elem.addClass("element-pass-cmp")
    }

    document.getElementsByAttributeValueContaining("src", profileFormstackWrapper).foreach { elem: Element =>
      elem.addClass("element-pass-cmp")
    }

    document
  }
}
