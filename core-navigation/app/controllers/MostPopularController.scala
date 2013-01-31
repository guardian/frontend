package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import feed.MostPopularAgent

object MostPopularController extends Controller with Logging with Formats {

  import play.api.Play.current

  val validFormats: Seq[String] = Seq("html", "json")

  def render(path: String, format: String) = Action { implicit request =>

    val edition = Edition(request, Configuration)
    val globalPopular = MostPopularAgent.mostPopular(edition).map(MostPopular("The Guardian", _)).toList

    val promiseOfSectionPopular = Akka.future(if (path != "/") lookup(edition, path).toList else Nil)

    Async {
      promiseOfSectionPopular.map { sectionPopular =>
        (sectionPopular ++ globalPopular) match {
          case Nil => NotFound
          case popular => renderMostPopular(popular, format)
        }
      }
    }
  }

  def renderGlobal(format: String) = render("/", format)

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response

    val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
    val popular = SupportedContentFilter(response.mostViewed map { new Content(_) }) take (10)

    if (popular.isEmpty) None else Some(MostPopular(heading, popular))
  }

  private def renderMostPopular(popular: Seq[MostPopular], format: String)(implicit request: RequestHeader) = {

    checkFormat(format).map { validFormat =>
      Cached(900) {
        if (validFormat == "json") {
          JsonComponent(views.html.fragments.mostPopular(popular, 5))
        } else {
          val page = new Page(
            Some("http://www.guardian.co.uk/"),
            "most-popular",
            "most-popular",
            "Most viewed", // yep, bit inconsistent... URLs say "most-viewed", too
            "GFE:Most Popular"
          )
          Ok(Compressed(views.html.mostPopular(page, popular)))
        }
      }
    } getOrElse (BadRequest)
  }

}