package pagepresser

import org.jsoup.Jsoup
import org.jsoup.nodes.Document

object NextGenInteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementById("interactive-content") != null &&
      document.getElementsByAttributeValue("rel","canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document, convertToHttps: Boolean) = {
    universalClean(document)
    //removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }

  override def extractOmnitureParams(document: Document) = InteractiveHtmlCleaner.extractOmnitureParams(document)

}
