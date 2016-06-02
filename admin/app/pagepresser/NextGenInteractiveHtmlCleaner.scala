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
    /*
    This cleaner currently leaves all of the page scripts intact so as not to break the functionality
    of the interactive content. When we have a better understanding of how to identify scripts that *can*
    be removed, we can reinstate a call to an alternative version of removeScripts(document) at this point.
    */
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }

  override def extractOmnitureParams(document: Document) = InteractiveHtmlCleaner.extractOmnitureParams(document)

}
