package pagepresser

import org.jsoup.nodes.Document
import scala.collection.JavaConverters._
import scala.io.Source

object InteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementById("interactive-content") != null &&
    !document.getElementsByAttributeValue("rel", "canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document, convertToHttps: Boolean): Document = {
    universalClean(document)
    removeScripts(document)
    removeByTagName(document, "noscript")
    if (convertToHttps) secureDocument(document)
    document
  }

  override def removeScripts(document: Document): Document = {
    val scripts = document.getElementsByTag("script").asScala
    val needsJquery = scripts.exists(_.html().toLowerCase.contains("jquery"))

    val (interactiveScripts, nonInteractiveScripts) = scripts.partition { e =>
      val parentIds = e.parents().asScala.map(p => p.id()).toList
      parentIds.contains("interactive-content")
    }
    nonInteractiveScripts.toList.foreach(_.remove())

    interactiveScripts.toList.map { interactiveElement =>
      if (interactiveElement.html().contains("swfobject")) {
        addSwfObjectScript(document)
      }
    }

    if (needsJquery) {
      addJqueryScript(document)
    }

    document
  }

  private def addJqueryScript(document: Document): Document = {
    val jqScript = """
    <script src="//pasteup.guim.co.uk/js/lib/jquery/1.8.1/jquery.min.js"></script>
    <script>
    var jQ = jQuery.noConflict();
    jQ.ajaxSetup({ cache: true });
  </script>"""
    document.body().prepend(jqScript)
    document
  }

  private def addSwfObjectScript(document: Document): Document = {
    val swfScriptOpt =
      try {
        val source = Source
          .fromInputStream(getClass.getClassLoader.getResourceAsStream("resources/r2/interactiveSwfScript.js"), "UTF-8")
          .getLines()
          .mkString
        Some(source)
      } catch {
        case ex: Exception =>
          log.error(ex.getMessage)
          None
      }
    swfScriptOpt.foreach { script =>
      val html = "<script type=\"text/javascript\">" + script + "</script>"
      document.head().append(html)
    }
    document
  }

}
