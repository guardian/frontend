package pagepresser

import org.jsoup.Jsoup
import org.jsoup.nodes.Document

object NextGenInteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementById("interactive-content") != null &&
      document.getElementsByAttributeValue("rel","canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document) = {
    universalClean(document)
    //removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
    val tmpDoc = Jsoup.parse(secureSource(document.html()))
    document.head().replaceWith(tmpDoc.head())
    document.body().replaceWith(tmpDoc.body())
    document
  }

  override def extractOmnitureParams(document: Document) = InteractiveHtmlCleaner.extractOmnitureParams(document)

  private def secureSource(src: String): String = {
    src.replaceAllLiterally(""""//""", """"https://""").replaceAllLiterally("'//", "'https://").replaceAllLiterally("http://", "https://")
  }

}
