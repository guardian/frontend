package pagepresser

import org.jsoup.nodes.Document

object SimpleHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document): Boolean = {
    document.getElementsByAttribute("data-poll-url").isEmpty &&
    document.getElementById("interactive-content") == null
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    universalClean(document)
    removeScripts(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }
}
