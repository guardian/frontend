package pagepresser

import org.jsoup.nodes.Document

object SimpleHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document): Boolean = {
    document.getElementsByAttribute("data-poll-url").isEmpty &&
    document.getElementById("interactive-content") == null
  }

  def cleanArchive(document: Document): Document = {
    removeScripts(document)
    removeByTagName(document, "noscript")
    secureDocument(document)
    document
  }
  override def clean(document: Document, convertToHttps: Boolean): Document = {
    universalClean(document)
    removeScripts(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }
}
