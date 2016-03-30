package pagepresser

import common.{ExecutionContexts, Logging}
import org.jsoup.nodes.{DataNode, Document, Element}
import play.api.libs.ws.WS

import scala.collection.JavaConversions._
import scala.concurrent.Future

object ComboCleaner extends ExecutionContexts with Logging {
  val fakeCacheBustId = "6d5811c93d9b815024b5a6c3ec93a54be18e52f0"

  def apply(document: Document, useMicroApp: Boolean = false): Future[Unit] = {
    import play.api.Play.current

    def inlineMicroApp(cacheBustId: String, path: String, extension: String): Future[Option[Element]] = {
      val url = s"http://combo.guim.co.uk/$cacheBustId/$path$extension"
      WS.url(url).get().flatMap { response =>
        response.status match {
          case 200 => {
            val elementTag = if (extension == ".css") Some("style") else None
            val script = elementTag.map { elementTag => document.createElement(elementTag).appendChild(new DataNode(response.body, ""/*baseUrl*/)) }
            Future.successful(script)
          }
          case non200 => {
            log.error(s"Unexpected response from combo microapp url $url, status code: $non200")
            Future.failed(new RuntimeException(s"Unexpected response from combo microapp url $url, status code: $non200"))
          }
        }
      }
    }


    try {
      Future.sequence(document.getAllElements.filter { el =>
        el.hasAttr("href") && el.attr("href").contains("combo.guim.co.uk")
      }.map { el =>

        val combinerRegex = """//combo.guim.co.uk/(\w+)/(.+)(\.\w+)$""".r("cacheBustId", "paths", "extension")
        val microAppRegex = """^m-(\d+)~(.+)""".r
        val numbersOnlyRegEx = """\d+""".r

        val href = el.attr("href")

        val combiner = combinerRegex.findFirstMatchIn(href)

        combiner.map { combiner =>
          val cacheBustId = combiner.group("cacheBustId")
          val extension = combiner.group("extension")
          val paths = combiner.group("paths").split('+')
          val futures = paths.map { path =>
            if (useMicroApp && microAppRegex.findFirstIn(path).isDefined) {
              // get the content and inline it
              val future = inlineMicroApp(cacheBustId, path, extension).map(_.map { element=>
                el.after(element)
              })
              future
            } else {
              val newPath = if(numbersOnlyRegEx.findFirstMatchIn(cacheBustId).isDefined) {
                s"//static.guim.co.uk/static/$fakeCacheBustId/$path$extension"
              } else {
                s"//static.guim.co.uk/static/$cacheBustId/$path$extension"
              }
              val newEl = el.clone.attr("href", newPath)
              el.after(newEl)
              Future.successful(())
            }
          }
          Future.sequence(futures.toList).map { _ =>
            el.remove()
          }

        }.getOrElse(Future.successful(()))

      }).map(_ => ())
    }
    catch {
      case e: Exception => {
        log.warn("Unable to convert links for document from http to protocol relative url.")
        Future.failed(e)
      }
    }
  }

}

