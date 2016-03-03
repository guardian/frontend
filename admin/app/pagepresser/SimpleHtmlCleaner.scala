package pagepresser

import org.jsoup.nodes.Document

object SimpleHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document) = {
    document.getElementsByAttribute("data-poll-url").isEmpty &&
    document.getElementById("interactive-content") == null
  }

  override def clean(document: Document) = {
    universalClean(document).map { _ =>
      removeScripts(document)
      createSimplePageTracking(document)
      removeByTagName(document, "noscript")
    }
  }
}
