package controllers

import common._
import contentapi.ContentApiClient
import feed.{DayMostPopularAgent, GeoMostPopularAgent, MostPopularAgent}
import model.Cached.RevalidatableResult
import model._
import play.api.Environment
import play.api.libs.json._
import play.api.mvc.{Action, Controller, RequestHeader}
import views.support.FaciaToMicroFormat2Helpers._

import scala.concurrent.Future

class MostPopularController(contentApiClient: ContentApiClient,
                            geoMostPopularAgent: GeoMostPopularAgent,
                            dayMostPopularAgent: DayMostPopularAgent,
                            mostPopularAgent: MostPopularAgent)
                           (implicit env: Environment) extends Controller with Logging with ExecutionContexts {
  val page = SimplePage(MetaData.make(
    "most-read",
    Some(SectionSummary.fromId("most-read")),
    "Most read"
  ))

  def renderHtml(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val globalPopular: Option[MostPopular] = {
      var globalPopularContent = mostPopularAgent.mostPopular(edition)
      if (globalPopularContent.nonEmpty)
        Some(MostPopular("across the guardian", "", globalPopularContent.map(_.faciaContent)))
      else
        None
    }
    val sectionPopular: Future[List[MostPopular]] = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

    sectionPopular.map { sectionPopular =>
      val sectionFirst = sectionPopular ++ globalPopular
      val globalFirst = globalPopular.toList ++ sectionPopular
      val mostPopular: List[MostPopular] = if (path == "global-development") sectionFirst else globalFirst

      mostPopular match {
        case Nil => NotFound
        case popular if !request.isJson => Cached(900) { RevalidatableResult.Ok(views.html.mostPopular(page, popular)) }
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

    val countryPopular = MostPopular("across the guardian", "", geoMostPopularAgent.mostPopular(countryCode).map(_.faciaContent))

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
        "trails" -> JsArray(dayMostPopularAgent.mostPopular(countryCode).map{ trail =>
          Json.obj(
            ("url", trail.content.metadata.url),
            ("headline", trail.content.trail.headline)
          )
        })
      )
    }
  }

  def renderPopularMicroformat2 = Action { implicit request =>
    val edition = Edition(request)
    val mostPopular = mostPopularAgent.mostPopular(edition) take 5

    Cached(900) {
      JsonComponent(
        "items" -> JsArray(Seq(
          Json.obj(
            "displayName" -> "most viewed",
            "showContent" -> mostPopular.nonEmpty,
            "content" ->  JsArray(mostPopular.map(content => isCuratedContent(content.faciaContent)))
          )
        ))
      )
    }
  }

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching most popular: $path for edition $edition")
    contentApiClient.getResponse(contentApiClient.item(path, edition)
      .tag(None)
      .showMostViewed(true)
    ).map{response =>
      val heading = response.section.map(s => "in " + s.webTitle.toLowerCase).getOrElse("across the guardian")
          val popular = response.mostViewed.getOrElse(Nil) map { RelatedContentItem(_) } take 10
          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular.map(_.faciaContent)))
    }
  }
}
