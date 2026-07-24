package views.support.cleaner

import org.jsoup.nodes.Document
import play.api.mvc.RequestHeader
import views.support.HtmlCleaner

case class AttributeCleaner(attributeName: String) extends HtmlCleaner {
  override def clean(document: Document)(implicit request: RequestHeader): Document = {
    document.select(s"[$attributeName]").removeAttr(attributeName)
    document
  }
}
