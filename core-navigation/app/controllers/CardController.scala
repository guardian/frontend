package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.ws.WS
import play.api.libs.json.{JsObject, Json}
import conf.Configuration
import org.jsoup.Jsoup
import java.net.URI

object CardController extends Controller with Logging with ExecutionContexts {

  def opengraph(resource: String) = Action { implicit request =>
    val r = new java.net.URI(resource).getPath
    r match {
      case i if (i.startsWith("http://www.theguardian.com")) =>
        Async {
          WS.url(r)
            .get().map { response =>
              response.status match {
                case 200 =>
                  val fragment = Jsoup.parseBodyFragment(response.body)

                  // Do not display any image if it is our fallback
                  var image = fragment.select("meta[property=og:image]").attr("content")
                  if (image.contains(conf.Configuration.facebook.imageFallback)) {
                    image = ""
                  }

                  JsonComponent(Json.toJson(Map(
                    "url" -> fragment.select("meta[property=og:url]").attr("content"),
                    "title" -> fragment.select("meta[property=og:title]").attr("content"),
                    "image" -> image,
                    "description" -> fragment.select("meta[property=og:description]").attr("content"),
                    "site_name" -> fragment.select("meta[property=og:site_name]").attr("content"),
                    "published_time" -> fragment.select("meta[property=article:published_time]").attr("content"),
                    "modified_time" -> fragment.select("meta[property=article:modified_time]").attr("content")
                  )).asInstanceOf[JsObject])
                case _ => NotFound
            }
          }
        }
      case w if (w.startsWith("http://en.wikipedia.org/wiki/")) =>
        Async {
          WS.url(r)
            .get().map { response =>
              response.status match {
                case 200 =>
                  val fragment = Jsoup.parseBodyFragment(response.body)
                  val firstParagraph = fragment.select("#mw-content-text > p").first
                  firstParagraph.select(".reference").remove()

                  val wiki = Map(
                    "url" -> resource,
                    "title" -> fragment.select("#firstHeading").text(),
                    "image" -> fragment.select(".image img").attr("src"),
                    "description" -> firstParagraph.text().split("\\.").headOption.getOrElse(""),
                    "site_name" -> "Wikipedia"
                  )
                  JsonComponent(Json.toJson(wiki).asInstanceOf[JsObject])
                case _ => NotFound
            }
          }
        }
      case _ => NotFound
    }
  }
}
