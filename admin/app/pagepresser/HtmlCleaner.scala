package pagepresser

import org.jsoup.nodes.Document
import scala.collection.JavaConversions._

object HtmlCleaner {

  def clean(document: Document): Document = {
    removeAds(document)
    removeGoogleSearchBox(document)
    removeShareLinks(document)
    removeRelatedComponent(document)
  }

  def removeAds(document: Document): Document = {
    val elements = document.getElementById("sub-header")
    val ads = elements.children().toList.filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
    ads.map(_.remove())

    val comments = elements.childNodes().filter(node => node.nodeName().equals("#comment"))
    comments.map(_.remove())

    val promos = document.getElementById("promo")
    if(promos != null) promos.remove()

    document
  }

  def removeGoogleSearchBox(document: Document): Document = removeByClass(document, "top-search-box")
  def removeShareLinks(document: Document): Document = removeByClass(document, "share-links")

  def removeRelatedComponent(document: Document): Document = {
    val element = document.getElementById("related")
    element.remove()
    document
  }

  private def removeByClass(document: Document, className: String): Document = {
    val element = document.getElementsByClass(className)
    element.remove()
    document
  }
}
