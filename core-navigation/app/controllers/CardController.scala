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
    val myUri = new java.net.URI(resource)
    val r = myUri.getPath
    val host = new java.net.URI(r).getHost

    val whiteList = List(
      "theguardian.com",
      "www.theguardian.com",
      "guardian.co.uk",
      "m.guardian.co.uk",
      "www.guardian.co.uk",
      "bbc.co.uk",
      "www.bbc.co.uk",
      "m.bbc.co.uk",
      "www.nytimes.com",
      "vimeo.com",
      "www.vimeo.com",
      "dailymotion.com",
      "www.dailymotion.com",
      "youtube.com",
      "www.youtube.com",
      "gov.uk")

    host match {
      case a if (whiteList.contains(a)) =>
        Async {
          WS.url(r)
            .get().map { response =>
              response.status match {
                case 200 =>
                  val fragment = Jsoup.parseBodyFragment(response.body)
                  JsonComponent(Json.toJson(Map(
                    "url" -> fragment.select("meta[property=og:url]").attr("content"),
                    "title" -> fragment.select("meta[property=og:title]").attr("content"),
                    "image" -> fragment.select("meta[property=og:image]").attr("content"),
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
