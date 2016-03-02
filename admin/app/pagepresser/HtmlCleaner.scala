package pagepresser

import com.netaporter.uri.Uri.parse
import common.{ExecutionContexts, Logging}
import org.jsoup.nodes.{DataNode, Document, Element}
import play.api.libs.ws.WS

import scala.collection.JavaConversions._
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}

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
    println("processing document")
    ComboCleaner(document)
  }

  object ComboCleaner extends ExecutionContexts {

    def apply(document: Document): Document = {
      import play.api.Play.current

      def inlineMicroApp(cacheBustId: String, path: String, extension: String): Future[Element] = {
        val url = s"http://combo.guim.co.uk/$cacheBustId/$path$extension"
        WS.url(url).get().flatMap { response =>
          response.status match {
            case 200 => {
              val elementTag = if (extension != ".css") "style" else "script"
              val script = document.createElement(elementTag).appendChild(new DataNode(/*response.body*/"var x = 45;\n", ""/*baseUrl*/))
              //println(s"result body ${script}")
              Future.successful(script)
            }
            case non200 => {
              //println(s"got $non200")
              log.error(s"Unexpected response from combo microapp url $url, status code: $non200")
              Future.failed(new RuntimeException(s"Unexpected response from combo microapp url $url, status code: $non200"))
            }
          }
        }
      }


      try {
        document.getAllElements.filter { el =>
          el.hasAttr("href") && el.attr("href").contains("combo.guim.co.uk")
        }.foreach { el =>

          val combinerRegex = """//combo.guim.co.uk/(\w+)/(.+)(\.\w+)$""".r("cacheBustId", "paths", "extension")
          val microAppRegex = """^m-(\d+)~(.+)""".r

          val href = el.attr("href")

          val combiner = combinerRegex.findFirstMatchIn(href)

          combiner.foreach { combiner =>
            val cacheBustId = combiner.group("cacheBustId")
            val extension = combiner.group("extension")
            val paths = combiner.group("paths").split('+')
            paths.map { path =>
              if (microAppRegex.findFirstIn(path).isDefined) {
                // get the content and inline it - FIXME await
                //el.after("<!---john john john --->")
                val future = inlineMicroApp(cacheBustId, path, extension).map { x=>
                  println(s"x: $x")
                  el.after(x)
                  //el.after("<p>hello world</p>")
                  //el.after("<!---hi hi hi --->").parent()
                }
                future.onFailure({case fail => println(s"failed: $fail")})
                future.onSuccess({case fail => println(s"succeeded: $fail")})
                Await.result(
                  future,
                10.seconds)
              } else {
                val newPath = s"//static.guim.co.uk/static/$cacheBustId/$path$extension"
                val newEl = el.clone.attr("href", newPath)
                el.after(newEl)
              }
            }
            el.remove()

          }

          el.attr("href", el.attr("href").replace("http://", "//"))
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
}
