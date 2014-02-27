package controllers

import common._
import conf._
import feed.{MostPopularAgent, GeoMostPopularAgent}
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import scala.concurrent.Future
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
            "html" -> views.html.fragments.collections.popular(popular),
            "faciaHtml" -> views.html.fragments.containers.popular(Config(s"$path/most-viewed/regular-stories", displayName = Option("Most popular")), Collection(popular.headOption.map(_.trails).getOrElse(Nil), None), PopularContainer(showMore = true), containerIndex = 1),
            "rightHtml" -> views.html.fragments.rightMostPopular(globalPopular)
          )
        }
      }
    }
  }

  private val countryNames = Map(
    "AU" -> "Australia",
    "US" -> "US",
    "IN" -> "India")

  def renderPopularGeoJson() = Action { implicit request =>

    val headers = request.headers.toSimpleMap
    val countryCode = headers.getOrElse("X-GU-GeoLocation","country:ROW").replace("country:","")

    val countryPopular = MostPopular("The Guardian", "", GeoMostPopularAgent.mostPopular(countryCode))

    Cached(900) {
      JsonComponent(
        "html" -> views.html.fragments.collections.popular(Seq(countryPopular)),
        "rightHtml" -> views.html.fragments.rightMostPopularGeo(countryPopular, countryNames.get(countryCode), countryCode),
        "country" -> countryCode
      )
    }
  }

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    SwitchingContentApi().item(path, edition)
      .tag(None)
      .showMostViewed(true)
      .response.map{response =>
      val heading = response.section.map(s => s.webTitle).getOrElse("The Guardian")
          val popular = response.mostViewed map { Content(_) } take 10
          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular))
    }
  }
}
