package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularAgent
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

object MostPopularController extends Controller with Logging {

  val page = new Page(
    Some("http://www.guardian.co.uk/"),
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )


  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopularAgent.mostPopular(edition).map(MostPopular("The Guardian", "", _)).toList
    val promiseOfSectionPopular = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          (sectionPopular ++ globalPopular) match {
            case Nil => NotFound
            case popular => {
              val htmlResponse = views.html.mostPopular(page, popular)
              val jsonResponse = views.html.fragments.mostPopular(popular, 5)
              renderFormat(htmlResponse, jsonResponse, 900)
            }
          }
      }
    }
  }

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response.map{response =>
      val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
          val popular = SupportedContentFilter(response.mostViewed map { new Content(_) }) take (10)

          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }
}