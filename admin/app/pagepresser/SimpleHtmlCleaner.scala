package pagepresser

import org.jsoup.nodes.Document

object SimpleHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document) = {
    log.info("*** canClean ***")
    document.getElementsByAttribute("data-poll-url").isEmpty &&
    document.getElementById("interactive-content") == null
  }

  override def clean(document: Document) = {
    log.info("*** clean ***")
    universalClean(document)
    removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
  }
}
