package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import feed.MostPopularAgent

object MostPopularController extends Controller with Logging {

  val page = new Page(
    Some("http://www.guardian.co.uk/"),
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  import play.api.Play.current

  def renderJson(path: String) = Action { implicit request =>
    val edition = Site(request).edition
    val globalPopular = MostPopularAgent.mostPopular(edition).map(MostPopular("The Guardian", "", _)).toList
    val promiseOfSectionPopular = Akka.future(if (path.nonEmpty) lookup(edition, path).toList else Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          (sectionPopular ++ globalPopular) match {
            case Nil => NotFound
            case popular => Cached(900)(JsonComponent(views.html.fragments.mostPopular(popular, 5)))
          }
      }
    }
  }

  def renderNoJavascript(path: String) = Action { implicit request =>
    val edition = Site(request).edition
    val globalPopular = MostPopularAgent.mostPopular(edition).map(MostPopular("The Guardian", "", _)).toList
    val promiseOfSectionPopular = Akka.future(if (path.nonEmpty) lookup(edition, path).toList else Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          (sectionPopular ++ globalPopular) match {
            case Nil => NotFound
            case popular => Cached(900)(Ok(Compressed(views.html.mostPopular(page, popular))))
          }
      }
    }
  }

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response

    val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
    val popular = SupportedContentFilter(response.mostViewed map { new Content(_) }) take (10)

    if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
  }
}