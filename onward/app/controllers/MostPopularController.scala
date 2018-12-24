package controllers

import java.time.Instant
import java.time.temporal.ChronoUnit

import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import feed.{DayMostPopularAgent, GeoMostPopularAgent, MostPopularAgent}
import layout.ContentCard
import model.Cached.RevalidatableResult
import model._
import models.OnwardCollection._
import models.{MostPopularGeoResponse, OnwardCollection, OnwardCollectionResponse}
import play.api.libs.json._
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers._

import scala.concurrent.Future

class MostPopularController(contentApiClient: ContentApiClient,
  geoMostPopularAgent: GeoMostPopularAgent,
  dayMostPopularAgent: DayMostPopularAgent,
  mostPopularAgent: MostPopularAgent,
  val controllerComponents: ControllerComponents)
  (implicit context: ApplicationContext) extends BaseController with Logging with ImplicitControllerExecutionContext {
    val page = SimplePage(MetaData.make(
    "most-read",
    Some(SectionId.fromId("most-read")),
    "Most read"
  ))

  def renderHtml(path: String): Action[AnyContent] = render(path)
  def render(path: String): Action[AnyContent] = Action.async { implicit request =>
    val edition = Edition(request)

    // Synchronous global popular, from the mostPopularAgent (stateful)
    val globalPopular: Option[MostPopular] = {
      val globalPopularContent = mostPopularAgent.mostPopular(edition)
      if (globalPopularContent.nonEmpty)
        Some(MostPopular("Across The&nbsp;Guardian", "", globalPopularContent.map(_.faciaContent)))
      else
        None
    }

    // Async section specific most Popular.
    val sectionPopular: Future[List[MostPopular]] = if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

    lazy val mostCards = mostPopularAgent.mostSingleCards.get().mapValues(ContentCard.fromApiContent(_))

    // map is not on a list, but on a Future
    sectionPopular.map { sectionPopular =>
      val sectionFirst = sectionPopular ++ globalPopular
      val globalFirst = globalPopular.toList ++ sectionPopular
      val mostPopular: List[MostPopular] = if (path == "global-development") sectionFirst else globalFirst

      mostPopular match {
        case Nil => NotFound
        case popular if request.isGuui => jsonResponse(popular)
        case popular if !request.isJson => Cached(900) {
          RevalidatableResult.Ok(views.html.mostPopular(page, popular))
        }
        case popular => Cached(2) {
          JsonComponent(
            "html" -> {
              if (Switches.ExtendedMostPopular.isSwitchedOn) {
                views.html.fragments.collections.popularExtended(popular, mostCards)
              } else {
                views.html.fragments.collections.popular(popular)
              }
            },
            "rightHtml" -> views.html.fragments.rightMostPopular(globalPopular)
          )
        }
      }
    }
  }

  private val countryNames = Map(
    "AU" -> "Australia",
    "US" -> "US",
    "IN" -> "India"
  )

  def renderPopularGeo(): Action[AnyContent] = Action { implicit request =>
    val headers = request.headers.toSimpleMap
    val countryCode = headers.getOrElse("X-GU-GeoLocation","country:row").replace("country:","")

    val countryPopular = MostPopular("Across The&nbsp;Guardian", "", geoMostPopularAgent.mostPopular(countryCode).map(_.faciaContent))

    if (request.isGuui) {
      jsonResponse(countryPopular, countryCode)
    } else {
      Cached(900) {
        JsonComponent(
          "html" -> views.html.fragments.collections.popular(Seq(countryPopular)),
          "rightHtml" -> views.html.fragments.rightMostPopularGeoGarnett(countryPopular, countryNames.get(countryCode), countryCode),
          "country" -> countryCode
        )
      }
    }
  }

  def jsonResponse(mostPopulars: Seq[MostPopular])(implicit request: RequestHeader): Result = {
    val responses = mostPopulars.map{section =>
      OnwardCollectionResponse(
        heading = section.heading,
        trails = OnwardCollection.trailsToItems(section.trails)
      )
    }

    Cached(900)(JsonComponent(responses))
  }

  def jsonResponse(mostPopular: MostPopular, countryCode: String)(implicit request: RequestHeader): Result = {
    val data = MostPopularGeoResponse(
      country = countryNames.get(countryCode),
      heading = mostPopular.heading,
      trails = OnwardCollection.trailsToItems(mostPopular.trails)
    )

    Cached(900)(JsonComponent(data))
  }

  def renderPopularDay(countryCode: String): Action[AnyContent] = Action { implicit request =>
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

  def renderPopularMicroformat2: Action[AnyContent] = Action { implicit request =>
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

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader): Future[Option[MostPopular]] = {
    log.info(s"Fetching most popular: $path for edition $edition")
    val capiItem = contentApiClient.item(path, edition)
      .tag(None)
      .showMostViewed(true)

    val capiItemWithDate = if (path == "film") capiItem.dateParam("from-date", Instant.now.minus(180, ChronoUnit.DAYS)) else capiItem

    contentApiClient.getResponse(capiItemWithDate).map { response =>
      val heading = response.section.map(s => "in " + s.webTitle).getOrElse("Across The&nbsp;Guardian")
      val popular = response.mostViewed.getOrElse(Nil) take 10 map (RelatedContentItem(_))
      if (popular.isEmpty) None else Some(MostPopular(heading, path, popular.map(_.faciaContent)))
    }
  }
}
