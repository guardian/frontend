package pagepresser

import com.netaporter.uri.Uri._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import scala.collection.JavaConversions._
import scala.io.Source

object InteractiveHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    log.info("*** canClean ***")
    document.getElementById("interactive-content") != null
  }

  override def clean(document: Document): Document = {
    log.info("*** clean ***")
    universalClean(document)
    removeScripts(document)
    createSimplePageTracking(document)
    removeByTagName(document, "noscript")
  }

  override def extractOmnitureParams(document: Document) = {
    val omnitureNoScript = if(document.getElementById("omnitureNoScript") != null) {
      document.getElementById("omnitureNoScript")
    } else {
//      val theTag = document.select("#interactive-content #interactive iframe").text()
//      val iframeBodyEx = """<body>.*<iframe(.*)?>(.*)</iframe></body>""".r
//      val doc = Jsoup.parseBodyFragment(iframeBodyEx.findFirstIn(theTag).getOrElse(""))
//      println("***************************")
//      println(doc.body())
//      println("***************************")
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

        //val tempDoc = Jsoup.parse(Jsoup.parse(Jsoup.parse(frame.html()).text()).text())

//        println("******** tempDoc *******")
//        println(tempDoc.html())
//        println("************************")
        tempDoc
      }.map(_.getElementById("omnitureNoScript")).headOption.orNull
    }

    val params: Map[String, Seq[String]] = if (omnitureNoScript != null) {
      parse(omnitureNoScript.getElementsByTag("img").attr("src")).query.paramMap
    } else {
      log.error("Failed to extract params from omnitureNoScript (element cannot be found)")
      Map.empty
    }
    println("***** params *****")
    println(params)
    println("******************")
    params
  }

  override def removeScripts(document: Document): Document = {
    log.info("*** removeScripts ***")
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
    log.info("*** addSwfObjectScript ***")

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
