package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import scala.collection.JavaConversions._
import scala.io.Source

object InteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementById("interactive-content") != null
  }

  override def clean(document: Document): Document = {
    BasicHtmlCleaner.basicClean(document)
    removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
  }

  override def extractOmnitureParams(document: Document): Map[String, Seq[String]] = {
    val tempDoc = Jsoup.parse(document.body.text())
    val omnitureNoScript = tempDoc.getElementById("omnitureNoScript")
    if (omnitureNoScript != null) {
      parse(omnitureNoScript.getElementsByTag("img").attr("src")).query.paramMap
    } else {
      Map.empty
    }
  }

  override def removeScripts(document: Document): Document = {
    val scripts = document.getElementsByTag("script")
    val (interactiveScripts, nonInteractiveScripts) = scripts.partition { e =>
      val parentIds = e.parents().map(p => p.id()).toList
      parentIds.contains("interactive-content")
    }
    nonInteractiveScripts.toList.foreach(_.remove())

    interactiveScripts.toList.map { interactiveElement =>
      if (interactiveElement.html().contains("swfobject")) {
        addSwfObjectScript(document)
      }
    }
    document
  }

  private def addSwfObjectScript(document: Document): Document = {

    val swfScriptOpt = try {
      val source = Source.fromInputStream(getClass.getClassLoader.getResourceAsStream("resources/r2/interactiveSwfScript.js"), "UTF-8").getLines().mkString
      Some(source)
    } catch {
      case ex: Exception => {
        log.error(ex.getMessage)
        None
      }
    }
    swfScriptOpt.foreach { script =>
      val html = "<script type=\"text/javascript\">" + script + "</script>"
      document.head().append(html)
    }
    document
  }

}
