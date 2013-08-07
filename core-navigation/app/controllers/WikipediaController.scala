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

  def render(path: String) = Action { implicit request =>

    Async {
          WS.url(path)
            .get().map { response =>
              val fragment = Jsoup.parseBodyFragment(response.body)
              
              val wiki = Map(
                          "heading" -> fragment.select("#firstHeading").text(),
                          "thumbnail" -> fragment.select(".image img").attr("src"),
                          "firstParagraph" -> fragment.select("#mw-content-text > p").first.text()
              )
              Ok(Json.toJson(wiki))
            }
      }
    

  }

}
