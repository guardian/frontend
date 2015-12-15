package pagepresser

import org.jsoup.nodes.Document
import scala.collection.JavaConversions._

object HtmlCleaner {

  def removeAds(document: Document): Document = {
    val elements = document.getElementById("sub-header")
    val ads = elements.children().toList.filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
    ads.map(_.remove())

    val comments = elements.childNodes().filter(node => node.nodeName().equals("#comment"))
    comments.map(_.remove())
    document
  }

}
