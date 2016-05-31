package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import scala.collection.JavaConversions._
import scala.io.Source

object InteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementById("interactive-content") != null &&
      !document.getElementsByAttributeValue("rel","canonical").attr("href").toLowerCase.contains("/ng-interactive/")
  }

  override def clean(document: Document) = {
    universalClean(document)
    removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
    secureDocument(document)
  }

  override def extractOmnitureParams(document: Document) = {
    val omnitureNoScript = if(document.getElementById("omnitureNoScript") != null) {
      document.getElementById("omnitureNoScript")
    } else {
      // Dear reviewer, this horrible code is here because I've found examples of interactives that have nested iframes.
      // Yes, honestly. Nested iframes. Which Jsoup struggles to parse properly.
      // Anyway, the omnitureNoScript element we're seeking may exist at some nested level and so this is an attempt at
      // working arounf the shortcomings of Jsoup's parser. It's horrible and I'm sorry. But I need to get on with
      // pressing these damned things. If you know a better way, please say.
      document.getElementsByTag("iframe").map { frame =>
        val tempDoc: Element = {
          val x = Jsoup.parseBodyFragment(frame.html()).getElementById("omnitureNoScript")
          if (x != null) {
            log.info("omnitureNoScript matched at level 1")
            x
          } else {
            val y = Jsoup.parseBodyFragment(Jsoup.parseBodyFragment(frame.html()).text()).getElementById("omnitureNoScript")
            if ( y != null) {
              log.info("omnitureNoScript matched at level 2")
              y
            } else {
              val z = Jsoup.parseBodyFragment(Jsoup.parseBodyFragment(Jsoup.parse(frame.html()).text()).text()).getElementById("omnitureNoScript")
              if (z != null) {
                log.info("omnitureNoScript matched at level 3")
                z
              } else {
                log.error("no omnitureNoScript element found")
                null
              }
            }
          }
        }
        tempDoc
      }.map(_.getElementById("omnitureNoScript")).headOption.orNull
    }

    val params: Map[String, Seq[String]] = if (omnitureNoScript != null) {
      parse(omnitureNoScript.getElementsByTag("img").attr("src")).query.paramMap
    } else {
      log.error("Failed to extract params from omnitureNoScript (element cannot be found)")
      Map.empty
    }
    params
  }

  override def removeScripts(document: Document): Document = {
    val scripts = document.getElementsByTag("script")
    val needsJquery = scripts.exists(_.html().toLowerCase.contains("jquery"))

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
