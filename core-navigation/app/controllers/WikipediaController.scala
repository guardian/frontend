package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.ws.WS
import play.api.libs.json.Json
import conf.Configuration
import org.jsoup.Jsoup

object WikipediaController extends Controller with Logging with ExecutionContexts {

  def render(resource: String) = Action { implicit request =>

    val wikiUrl = "http://en.wikipedia.org/wiki/" + resource

    Async {
          WS.url(wikiUrl)
            .get().map { response =>
              val fragment = Jsoup.parseBodyFragment(response.body)
              val firstParagraph = fragment.select("#mw-content-text > p").first
              firstParagraph.select(".reference").remove()
 
              val wiki = Map(
                          "og:title" -> fragment.select("#firstHeading").text(),
                          "og:image" -> fragment.select(".image img").attr("src"),
                          "og:description" -> firstParagraph.text()
              )
              Ok(Json.toJson(wiki))
            }
      }
    

  }

}
