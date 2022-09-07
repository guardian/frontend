package pagepresser

import common.{GuLogging}
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import conf.Configuration

import scala.jdk.CollectionConverters._

abstract class HtmlCleaner extends GuLogging {
  lazy val fallbackCacheBustId = Configuration.r2Press.fallbackCachebustId
  lazy val staticRegEx = """//static.guim.co.uk/static/(?<cacheBustId>\w+)/(?<paths>.+)(?<extension>\.\w+)$""".r
  lazy val nonDigitRegEx = """\D+""".r

  def canClean(document: Document): Boolean
  def clean(document: Document, convertToHttps: Boolean): Document

  protected def universalClean(document: Document): Document = {
    removeAds(document)
    removeByClass(document, "top-search-box")
    removeByClass(document, "share-links")
    //removeRelatedComponent(document) This removes the byline on datablog pieces, but may be needed elsewhere
    removeByClass(document, "user-details")
    removeByClass(document, "initially-off")
    removeByClass(document, "comment-count")
    replaceLinks(document)
    repairStaticLinks(document)
    repairStaticSources(document)
    deComboLinks(document)
  }

  def repairStaticLinks(document: Document): Document = {
    document.getAllElements.asScala
      .filter { el =>
        el.hasAttr("href") && el.attr("href").contains("/static/")
      }
      .foreach { el =>
        val staticLink = staticRegEx.findFirstMatchIn(el.attr("href"))
        staticLink.foreach { link =>
          val cacheBustId = link.group("cacheBustId")
          val extension = link.group("extension")
          val paths = link.group("paths").split('+')
          paths.map { path =>
            val newPath = if (nonDigitRegEx.findFirstMatchIn(cacheBustId).isEmpty) {
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
    val elementsWithSrc = document.getAllElements.asScala.filter { el =>
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
      document.getAllElements.asScala
        .filter { el =>
          (el.hasAttr("href") && el.attr("href").contains("http://")) || (el
            .hasAttr("src") && el.attr("src").contains("http://"))
        }
        .foreach { el =>
          if (el.hasAttr("href")) {
            el.attr("href", el.attr("href").replace("http://", "//"))
          } else {
            el.attr("src", el.attr("src").replace("http://", "//"))
          }
        }
      document
    } catch {
      case e: Exception =>
        log.warn("Unable to convert links for document from http to protocol relative url.")
        document
    }
  }

  def removeScripts(document: Document): Document = {
    document.getElementsByTag("script").asScala.toList.foreach(_.remove())
    document
  }

  def removeAds(document: Document): Document = {
    val element = document.getElementById("sub-header")

    if (element != null) {
      val ads = element
        .children()
        .asScala
        .toList
        .filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
      ads.foreach(_.remove())

      val htmlComments = element.childNodes().asScala.filter(node => node.nodeName().equals("#comment"))
      htmlComments.foreach(_.remove())

      val promo = document.getElementById("promo")
      if (promo != null) promo.remove()
    }

    document
  }

  def removeRelatedComponent(document: Document): Document = {
    val element = document.getElementById("related")
    if (element != null) element.remove()
    document
  }

  def removeByClass(document: Document, className: String): Document = {
    document.getElementsByClass(className).asScala.foreach(_.remove())
    document
  }

  def removeByTagName(document: Document, tagName: String): Document = {
    document.getElementsByTag(tagName).asScala.foreach(_.remove())
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
    document.getAllElements.asScala.filter(elementContainsCombo).foreach { el =>
      val combinerRegex = """//combo.guim.co.uk/(?<cacheBustId>\w+)/(?<paths>.+)(?<extension>\.\w+)$""".r
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
          val newPath = if (nonDigitRegEx.findFirstMatchIn(cacheBustId).isEmpty) {
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

  def secureDocument(document: Document): Document = {
    val tmpDoc = Jsoup.parse(secureSource(document.html()))
    document.head().replaceWith(tmpDoc.head())
    document.body().replaceWith(tmpDoc.body())
    document
  }

  private def secureSource(src: String): String = {
    src.replace("http://", "//")
  }

}
