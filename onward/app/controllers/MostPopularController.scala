package controllers

import common._
import conf._
import feed.{MostPopularAgent, GeoMostPopularAgent, DayMostPopularAgent}
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services.FaciaContentConvert
import scala.concurrent.Future
import play.api.libs.json.{Json, JsArray}
import LiveContentApi.getResponse

object MostPopularController extends Controller with Logging with ExecutionContexts {
  val page = new Page(
    "most-read",
    "most-read",
    "Most read",
    "GFE:Most Read"
  )

  def renderHtml(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val globalPopular: Option[MostPopular] = {
      var globalPopularContent = MostPopularAgent.mostPopular(edition)
      if (globalPopularContent.nonEmpty)
        Some(MostPopular("across the guardian", "", globalPopularContent.map(FaciaContentConvert.frontendContentToFaciaContent)))
      else
        None
    }
    val sectionPopular: Future[List[MostPopular]] = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

    sectionPopular.map { sectionPopular =>
      sectionPopular ++ globalPopular match {
        case Nil => NotFound
        case popular if !request.isJson => Cached(900) { Ok(views.html.mostPopular(page, popular)) }
        case popular => Cached(900) {
          JsonComponent(
            "html" ->  views.html.fragments.collections.popular(popular),
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

  def renderPopularGeo() = Action { implicit request =>

    val headers = request.headers.toSimpleMap
    val countryCode = headers.getOrElse("X-GU-GeoLocation","country:row").replace("country:","")

    val countryPopular = MostPopular("across the guardian", "", GeoMostPopularAgent.mostPopular(countryCode).map(FaciaContentConvert.frontendContentToFaciaContent))

    Cached(900) {
      JsonComponent(
        "html" -> views.html.fragments.collections.popular(Seq(countryPopular)),
        "rightHtml" -> views.html.fragments.rightMostPopularGeo(countryPopular, countryNames.get(countryCode), countryCode),
        "country" -> countryCode
      )
    }
  }

  def renderPopularDay(countryCode: String) = Action { implicit request =>
    Cached(900) {
      JsonComponent(
        "trails" -> JsArray(DayMostPopularAgent.mostPopular(countryCode).map{ trail =>
          Json.obj(
            ("url", trail.url),
            ("headline", trail.headline)
          )
        })
      )
    }
  }

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    getResponse(LiveContentApi.item(path, edition)
      .tag(None)
      .showMostViewed(true)
    ).map{response =>
      val heading = response.section.map(s => "in " + s.webTitle.toLowerCase).getOrElse("across the guardian")
          val popular = response.mostViewed map { Content(_) } take 10
          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular.map(FaciaContentConvert.frontendContentToFaciaContent)))
    }
  }
}
