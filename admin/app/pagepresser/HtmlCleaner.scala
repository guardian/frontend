package pagepresser

import com.netaporter.uri.Uri.parse
import common.Logging
import org.jsoup.nodes.Document

import scala.collection.JavaConversions._
import scala.io.Source

abstract class HtmlCleaner extends Logging {
  def canClean(document: Document): Boolean
  def clean(document: Document): Document
}

object BasicHtmlCleaner extends HtmlCleaner {

  override def canClean(document: Document) = {
    document.getElementsByAttribute("data-poll-url").isEmpty
  }

  override def clean(document: Document) = {
    if (canClean(document)) {
      basicClean(document)
    } else {
      document
    }
  }

  def basicClean(document: Document): Document = {
    removeAds(document)
    removeByClass(document, "top-search-box")
    removeByClass(document, "share-links")
    removeRelatedComponent(document)
    removeByClass(document, "user-details")
    removeByClass(document, "initially-off")
    removeByClass(document, "comment-count")

    //fetch omniture data before stripping it. then rea-dd it for simple page tracking
    val omnitureQueryString = fetchOmnitureTags(document)
    removeScriptsTagsExceptInteractives(document)
    removeByTagName(document, "noscript")
    createSimplePageTracking(document, omnitureQueryString)

  }

  def removeScriptsTagsExceptInteractives(document: Document): Document = {
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

  def createSimplePageTracking(document: Document, omnitureQueryString: String): Document = {
    val omnitureTag = "<!---Omniture page tracking for pressed page ---> <img src=\"https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100?" + omnitureQueryString + "\" width=\"1\" height=\"1\"/>"


    document.body().append(omnitureTag)
    document
  }

  def fetchOmnitureTags(document: Document): String = {
    val omnitureCode = document.getElementById("omnitureNoScript").getElementsByTag("img").attr("src")
    val params = parse(omnitureCode).query.paramMap

    val requiredParams: Map[String, Seq[String]] = params.filterKeys(key => List("pageName", "ch", "g", "ns").contains(key)) ++
      Map("AQB" -> List("1"),
          "ndh" -> List("1"),
          "c19" -> List("frontendarchive"),
          "ce" -> List("UTF-8"),
          "cpd" -> List("2"),
          "AQE" -> List("1"),
          "v14" -> List("D=r"),
          "v9" -> List("D=g"))

    requiredParams.flatMap { case ((key: String, value: Seq[String])) =>
      for (v <- value) yield {
        val updatedValue = if(v.contains("&")) {
          v.replace("&", "%26")
        } else v
        s"$key=$updatedValue"
      }
    }.mkString("&")
  }

  def removeAds(document: Document): Document = {
    val elements = document.getElementById("sub-header")
    val ads = elements.children().toList.filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
    ads.foreach(_.remove())

    val htmlComments = elements.childNodes().filter(node => node.nodeName().equals("#comment"))
    htmlComments.foreach(_.remove())

    val promos = document.getElementById("promo")
    if(promos != null) promos.remove()

    document
  }

  def removeRelatedComponent(document: Document): Document = {
    val element = document.getElementById("related")
    if(element != null) element.remove()
    document
  }

  private def removeByClass(document: Document, className: String): Document = {
    document.getElementsByClass(className).foreach(_.remove())
    document
  }

  private def removeByTagName(document: Document, tagName: String): Document = {
    document.getElementsByTag(tagName).foreach(_.remove())
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
