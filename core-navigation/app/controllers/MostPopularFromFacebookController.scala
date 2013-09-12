package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularFromFacebookAgent

import concurrent.Future

object MostPopularFromFacebookController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularFromFacebookAgent.mostPopular)
    val promiseOfSectionPopular = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)
    Async {
      promiseOfSectionPopular.map {
        sectionPopular =>
          sectionPopular :+ globalPopular match {
            case Nil => NotFound
            case popular => {
              Cached(900){
                if (request.isJson)
                  JsonComponent(
                    "html" -> views.html.fragments.mostPopular(popular, 5),
                    "trails" -> popular.headOption.map(_.trails).getOrElse(Nil).map(_.url)
                  )
                else
                  Ok(views.html.mostPopular(page, popular))
              }
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
          val popular = SupportedContentFilter(response.mostViewed map { Content(_) }) take 10

          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }

}
