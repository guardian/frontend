package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import feed.MostPopularAgent

import concurrent.Future
import scala.util.Random

object MostPopularController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )


  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(edition))
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

  def renderCard() = Action { implicit request =>
    val edition = Edition(request)
    val trails = Random.shuffle(MostPopularAgent.mostPopular(edition))
    if(trails.nonEmpty) {
      val jsonResponse = () => views.html.fragments.cards.card(trails.head, "right", "Most read", "Story pack card | most read")
      renderFormat(jsonResponse, 60)
    } else {
      NotFound
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