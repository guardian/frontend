package controllers

import common._
import conf._
import feed.MostPopularAgent
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.json._
import scala.concurrent.Future
import scala.util.Random
import views.support.PopularContainer


object MostPopularController extends Controller with Logging with ExecutionContexts {

  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val globalPopular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(edition))
    val sectionPopular: Future[List[MostPopular]] = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

    sectionPopular.map { sectionPopular =>
      sectionPopular :+ globalPopular match {
        case Nil => NotFound
        case popular if !request.isJson => Cached(900) { Ok(views.html.mostPopular(page, popular)) }
        case popular => Cached(900) {
          JsonComponent(
            "html" -> views.html.fragments.mostPopular(popular, 5),
            "faciaHtml" -> views.html.fragments.containers.popular(Config("uk/popular/regular-stories", displayName = Option("Most popular"), collectionTone=None, href=None, groups=Nil, roleName=None), Collection(popular.headOption.map(_.trails).getOrElse(Nil).take(10), None), PopularContainer(showMore = true), containerIndex = 1),
            "trails" -> JsArray(popular.headOption.map(_.trails).getOrElse(Nil).map(TrailToJson(_)))
          )
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
          val popular = response.mostViewed map { Content(_) } take (10)
          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }

  private def lookupExpandable(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .showFields("headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl,body")
      .response.map{response =>
      val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
      val popular = response.mostViewed map { Content(_) } take (10)

      if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }
}
