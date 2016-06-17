package pagepresser

import org.jsoup.nodes.Document

object SimpleHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document) = {
    document.getElementsByAttribute("data-poll-url").isEmpty &&
    document.getElementById("interactive-content") == null
  }

  override def clean(document: Document, convertToHttps: Boolean) = {
    universalClean(document)
    removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }
}
