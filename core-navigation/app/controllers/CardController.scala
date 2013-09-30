package controllers

import common._
import java.net.URI
import org.jsoup.Jsoup
import play.api.mvc.{ Controller, Action }
import play.api.libs.ws.WS
import play.api.libs.json.{ JsObject, Json }
import scala.concurrent.Future


object CardController extends Controller with Logging with ExecutionContexts {

  def opengraph(resource: String) = Action.async { implicit request =>
    val myUri = new URI(resource)
    val r = myUri.getPath
    val host = new URI(r).getHost

    val whiteList = List(
      "theguardian.com",
      "www.theguardian.com",
      "guardian.co.uk",
      "m.guardian.co.uk",
      "www.guardian.co.uk",
      "bbc.co.uk",
      "www.bbc.co.uk",
      "m.bbc.co.uk",
      "vimeo.com",
      "www.vimeo.com",
      "dailymotion.com",
      "www.dailymotion.com",
      "youtube.com",
      "www.youtube.com",
      "gov.uk")

    host match {
      case a if (whiteList.contains(a)) => WS.url(r).get().map { response =>
          response.status match {
            case 200 =>
              val fragment = Jsoup.parseBodyFragment(response.body)

              val image = Option(fragment.select("meta[property=og:image]").attr("content"))
              val nonFallbackImage = image filter { !_.contains(conf.Configuration.facebook.imageFallback) }
              // To test a story that has no image:
              // /cards/opengraph/http%3A%2F%2Fwww.theguardian.com%2Fmedia%2Fgreenslade%2F2013%2Faug%2F22%2Fjournalist-safety-egypt

              JsonComponent(Json.toJson(Map(
                ("url", fragment.select("meta[property=og:url]").attr("content")),
                ("title", fragment.select("meta[property=og:title]").attr("content")),
                ("image", nonFallbackImage.getOrElse("")),
                ("description", fragment.select("meta[property=og:description]").attr("content")),
                ("site_name", fragment.select("meta[property=og:site_name]").attr("content")),
                ("published_time", fragment.select("meta[property=article:published_time]").attr("content")),
                ("modified_time", fragment.select("meta[property=article:modified_time]").attr("content")),
                ("host", a.replaceAll("^www\\.", ""))
              )).asInstanceOf[JsObject])
            case _ => NotFound
          }
        }

      case w if (w.startsWith("en.wikipedia.org")) => WS.url(r).get().map { response =>
          response.status match {
            case 200 =>
              val fragment = Jsoup.parseBodyFragment(response.body)
              val firstParagraph = fragment.select("#mw-content-text > p").first
              firstParagraph.select(".reference").remove()

              JsonComponent(Json.toJson(Map(
                ("url", resource),
                ("title", fragment.select("#firstHeading").text()),
                ("image", fragment.select(".image img").attr("src")),
                ("description", firstParagraph.text().split("\\.").headOption.getOrElse("")),
                ("site_name", "Wikipedia"),
                ("host", "wikipedia.org")
              )).asInstanceOf[JsObject])
            case _ => NotFound
          }
        }

      case _ => Future { NotFound }
    }
  }
}
