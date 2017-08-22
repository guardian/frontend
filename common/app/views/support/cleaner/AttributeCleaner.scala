package views.support.cleaner

import org.jsoup.nodes.Document
import views.support.HtmlCleaner

case class AttributeCleaner(attributeName: String) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    document.select(s"[$attributeName]").removeAttr(attributeName)
    document
  }
}
