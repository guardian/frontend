package pagepresser

import com.netaporter.uri.Uri.parse
import common.Logging
import org.jsoup.Jsoup
import org.jsoup.nodes.Document

import scala.collection.JavaConversions._
import scala.io.Source

abstract class HtmlCleaner extends Logging {
  def canClean(document: Document): Boolean

  def clean(document: Document): Document

  protected def universalClean(document: Document): Document = {
    removeAds(document)
    removeByClass(document, "top-search-box")
    removeByClass(document, "share-links")
    removeRelatedComponent(document)
    removeByClass(document, "user-details")
    removeByClass(document, "initially-off")
    removeByClass(document, "comment-count")
    replaceLinks(document)
  }

  def replaceLinks(document: Document): Document = {
    try {
      document.getAllElements.filter{ el =>
        el.hasAttr("href") && el.attr("href").contains("http://")
      }.foreach{ el =>
        val protoRelative = el.attr("href").replace("http://", "//")
        el.attr("href", protoRelative)
      }
      document
    }
    catch {
      case e: Exception => {
        log.warn("Unable to convert links for document from http to protocol relative url.")
        document
      }
    }
  }

  def extractOmnitureParams(document: Document): Map[String, Seq[String]] = {
    val omnitureNoScript = document.getElementById("omnitureNoScript")
    if (omnitureNoScript != null) {
      parse(omnitureNoScript.getElementsByTag("img").attr("src")).query.paramMap
    } else {
      Map.empty
    }
  }

  def removeScripts(document: Document): Document = {
    document.getElementsByTag("script").toList.foreach(_.remove())
    document
  }

  def createSimplePageTracking(document: Document): Document = {
    val omnitureQueryString = fetchOmnitureTags(document)

    val newOmnitureScriptBase = "https://hits-secure.theguardian.com/b/ss/guardiangu-network/1/JS-1.4.1/s985205503180623100"

    document.getElementsByTag("img").exists { element =>
      element.hasAttr("src") && element.attr("src").contains(newOmnitureScriptBase)
    } match {
      case true =>
        log.info(s"Archive omniture script exists and was not replaced")
        document
      case false =>
        val omnitureTag = "<!---Omniture page tracking for pressed page ---> <img src=\"" + newOmnitureScriptBase + "?" + omnitureQueryString + "\" width=\"1\" height=\"1\"/>"
        document.body().append(omnitureTag)
        log.info("Archive omniture script appended")
        document
    }
  }

  def fetchOmnitureTags(document: Document): String = {
    val params = extractOmnitureParams(document)
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
    val element = document.getElementById("sub-header")

    if (element != null) {
      val ads = element.children().toList.filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
      ads.foreach(_.remove())

      val htmlComments = element.childNodes().filter(node => node.nodeName().equals("#comment"))
      htmlComments.foreach(_.remove())

      val promo = document.getElementById("promo")
      if(promo != null) promo.remove()
    }

    document
  }

  def removeRelatedComponent(document: Document): Document = {
    val element = document.getElementById("related")
    if(element != null) element.remove()
    document
  }

  def removeByClass(document: Document, className: String): Document = {
    document.getElementsByClass(className).foreach(_.remove())
    document
  }

  def removeByTagName(document: Document, tagName: String): Document = {
    document.getElementsByTag(tagName).foreach(_.remove())
    document
  }
}
