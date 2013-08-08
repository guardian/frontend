package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.ws.WS
import play.api.libs.json.Json
import conf.Configuration
import org.jsoup.Jsoup

object CardController extends Controller with Logging with ExecutionContexts {

  def opengraph(resource: String) = Action { implicit request =>
    Async {
          WS.url(resource) // TODO - whitelist to avoid becoming an open proxy
            .get().map { response =>
              response.status match {
                case 200 => 
                  val fragment = Jsoup.parseBodyFragment(response.body)
                  Ok(Json.toJson(Map(
                    "og:title" -> fragment.select("meta[property=og:title]").attr("content"),
                    "og:image" -> fragment.select("meta[property=og:image]").attr("content"),
                    "og:description" -> fragment.select("meta[property=og:description]").attr("content")
                  ))).as("application/json")
                case _ => NotFound 
             }
          }
      }
  }

  def wikipedia(resource: String) = Action { implicit request =>
    val wikiUrl = "http://en.wikipedia.org/wiki/" + resource
    Async {
          WS.url(wikiUrl)
            .get().map { response =>
              response.status match {
                case 200 =>
                  val fragment = Jsoup.parseBodyFragment(response.body)
                  val firstParagraph = fragment.select("#mw-content-text > p").first
                  firstParagraph.select(".reference").remove()
     
                  val wiki = Map(
                              "og:title" -> fragment.select("#firstHeading").text(),
                              "og:image" -> fragment.select(".image img").attr("src"),
                              "og:description" -> firstParagraph.text()
                  )
                  Ok(Json.toJson(wiki)).as("application/json")
                case _ => NotFound       
             }
          }
      }
  }

}
