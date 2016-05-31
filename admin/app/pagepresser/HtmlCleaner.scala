package pagepresser

import com.netaporter.uri.Uri.parse
import common.{ExecutionContexts, Logging}
import org.jsoup.nodes.{Element, Document}
import conf.Configuration

import scala.collection.JavaConversions._

abstract class HtmlCleaner extends Logging with ExecutionContexts {
  val fallbackCacheBustId = Configuration.r2Press.fallbackCachebustId
  lazy val staticRegEx = """//static.guim.co.uk/static/(\w+)/(.+)(\.\w+)$""".r("cacheBustId", "paths", "extension")
  lazy val nonDigitRegEx = """\D+""".r

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
    repairStaticLinks(document)
    repairStaticSources(document)
    deComboLinks(document)
  }

  def repairStaticLinks(document: Document): Document = {
    document.getAllElements.filter { el =>
      el.hasAttr("href") && el.attr("href").contains("/static/")
    }.foreach { el =>
      val staticLink = staticRegEx.findFirstMatchIn(el.attr("href"))
      staticLink.foreach { link =>
        val cacheBustId = link.group("cacheBustId")
        val extension = link.group("extension")
        val paths = link.group("paths").split('+')
        paths.map { path =>
          val newPath = if(nonDigitRegEx.findFirstMatchIn(cacheBustId).isEmpty) {
            s"//static.guim.co.uk/static/$fallbackCacheBustId/$path$extension"
          } else {
            s"//static.guim.co.uk/static/$cacheBustId/$path$extension"
          }
          val newEl = el.clone.attr("href", newPath)
          el.after(newEl)
        }
      }
      el.remove()
    }
    document
  }

  def repairStaticSources(document: Document): Document = {
    val elementsWithSrc = document.getAllElements.filter { el =>
      el.hasAttr("src") && el.attr("src").contains("/static/")
    }
    elementsWithSrc.foreach { el =>
      val staticSrc = staticRegEx.findFirstMatchIn(el.attr("src"))
      staticSrc.foreach { src =>
        val cacheBustId = src.group("cacheBustId")
        val extension = src.group("extension")
        val paths = src.group("paths").split('+')
        paths.map { path =>
          val newPath = if (nonDigitRegEx.findFirstMatchIn(cacheBustId).isEmpty) {
            s"//static.guim.co.uk/static/$fallbackCacheBustId/$path$extension"
          } else {
            s"//static.guim.co.uk/static/$cacheBustId/$path$extension"
          }
          val newEl = el.clone.attr("src", newPath)
          el.after(newEl)
        }
      }
      el.remove()
    }
    document
  }

  def replaceLinks(document: Document): Document = {
    try {
      document.getAllElements.filter{ el =>
        (el.hasAttr("href") && el.attr("href").contains("http://")) || (el.hasAttr("src") && el.attr("src").contains("http://"))
      }.foreach{ el =>

        if (el.hasAttr("href")) {
          el.attr("href", el.attr("href").replace("http://", "//"))
        } else {
          el.attr("src", el.attr("src").replace("http://", "//"))
        }
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

  private def elementContainsCombo(el: Element): Boolean = {
    val comboHost = "combo.guim.co.uk"
    val attr = if (el.hasAttr("href")) {
      el.attr("href")
    } else if (el.hasAttr("src")) {
      el.attr("src")
    } else {
      ""
    }
    attr.contains(comboHost)
  }

  def deComboLinks(document: Document): Document = {
    document.getAllElements.filter( elementContainsCombo ) .foreach { el =>

      val combinerRegex = """//combo.guim.co.uk/(\w+)/(.+)(\.\w+)$""".r("cacheBustId", "paths", "extension")
      val microAppRegex = """^m-(\d+)~(.+)""".r
      val href = if (el.hasAttr("href")) {
        el.attr("href")
      } else {
        el.attr("src")
      }
      val combiner = combinerRegex.findFirstMatchIn(href)

      combiner.foreach { combiner =>
        val cacheBustId = combiner.group("cacheBustId")
        val extension = combiner.group("extension")
        val paths = combiner.group("paths").split('+')
        paths.map { path =>
          val newPath = if(nonDigitRegEx.findFirstMatchIn(cacheBustId).isEmpty) {
            s"//static.guim.co.uk/static/$fallbackCacheBustId/$path$extension"
          } else {
            s"//static.guim.co.uk/static/$cacheBustId/$path$extension"
          }
          val newEl = if (el.hasAttr("href")) {
            el.clone.attr("href", newPath)
          } else {
            el.clone.attr("src", newPath)
          }
          el.after(newEl)
        }
        el.remove()
      }
    }
    document
  }
}
