package controllers

import com.madgag.scala.collection.decorators.MapDecorator

import java.time.Instant
import java.time.temporal.ChronoUnit
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import feed.{DayMostPopularAgent, GeoMostPopularAgent, MostPopularAgent, Country}
import layout.ContentCard
import model.Cached.RevalidatableResult
import model._
import model.dotcomrendering.{
  MostPopularGeoResponse,
  MostPopularCollectionResponse,
  OnwardCollectionResponse,
  OnwardCollectionResponseDCR,
  Trail,
}
import play.api.libs.json._
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers._

import scala.concurrent.Future
import agents.DeeplyReadAgent

class MostPopularController(
    contentApiClient: ContentApiClient,
    geoMostPopularAgent: GeoMostPopularAgent,
    dayMostPopularAgent: DayMostPopularAgent,
    mostPopularAgent: MostPopularAgent,
    deeplyReadAgent: DeeplyReadAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with implicits.Requests {
  val page = SimplePage(
    MetaData.make(
      "most-read",
      Some(SectionId.fromId("most-read")),
      "Most read",
    ),
  )

  def renderHtml(path: String): Action[AnyContent] = render(path)

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      val edition = Edition(request)

      // Synchronous global popular, from the mostPopularAgent (stateful)
      val globalPopular: Option[MostPopular] = {
        val globalPopularContent = mostPopularAgent.mostPopular(edition)
        if (globalPopularContent.nonEmpty)
          Some(MostPopular("Across the&nbsp;Guardian", "", globalPopularContent.map(_.faciaContent)))
        else
          None
      }

      // Async section specific most Popular.
      val sectionPopular: Future[List[MostPopular]] =
        if (path.nonEmpty) lookup(edition, path).map(_.toList) else Future(Nil)

      // map is not on a list, but on a Future
      sectionPopular.map { sectionPopular =>
        val sectionFirst = sectionPopular ++ globalPopular
        val globalFirst = globalPopular.toList ++ sectionPopular
        val mostPopular: List[MostPopular] = if (path == "global-development") sectionFirst else globalFirst

        mostPopular match {
          case Nil                         => NotFound
          case popular if request.forceDCR => jsonResponse(popular, mostCards())
          case popular if !request.isJson =>
            Cached(900) {
              RevalidatableResult.Ok(views.html.mostPopular(page, popular))
            }
          case popular =>
            Cached(2) {
              JsonComponent(
                "html" -> {
                  if (Switches.ExtendedMostPopular.isSwitchedOn) {
                    views.html.fragments.collections.popularExtended(popular, mostCards())
                  } else {
                    views.html.fragments.collections.popular(popular)
                  }
                },
                "rightHtml" -> views.html.fragments.rightMostPopular(globalPopular),
              )
            }
        }
      }
    }

  private val countryNames = Map(
    "au" -> "Australia",
    "us" -> "US",
    "in" -> "India",
  )

  def renderPopularGeo(): Action[AnyContent] =
    Action { implicit request =>
      val headers = request.headers.toSimpleMap
      val country = Country.fromRequestHeader(request)
      val countryPopular =
        MostPopular(
          "Across the&nbsp;Guardian",
          "",
          geoMostPopularAgent.mostPopular(country).map(_.faciaContent),
        )

      if (request.forceDCR) {
        jsonResponse(countryPopular, country)
      } else {
        Cached(900) {
          JsonComponent(
            "html" -> {
              if (Switches.ExtendedMostPopularFronts.isSwitchedOn) {
                views.html.fragments.collections.popularExtended(Seq(countryPopular), mostCards())
              } else {
                views.html.fragments.collections.popular(Seq(countryPopular))
              }
            },
            "rightHtml" -> views.html.fragments
              .rightMostPopularGeoGarnett(countryPopular, countryNames.get(country.code), country.code.toUpperCase()),
            "country" -> country.code.toUpperCase(),
          )
        }
      }
    }

  def jsonResponse(mostPopulars: Seq[MostPopular], mostCards: Map[String, Option[ContentCard]])(implicit
      request: RequestHeader,
  ): Result = {
    val tabs = mostPopulars.map { section =>
      OnwardCollectionResponse(
        heading = section.heading,
        trails = section.trails.map(Trail.pressedContentToTrail).take(10),
      )
    }
    val mostCommented = mostCards.getOrElse("most_commented", None).flatMap { contentCard =>
      Trail.contentCardToTrail(contentCard)
    }
    val mostShared = mostCards.getOrElse("most_shared", None).flatMap { contentCard =>
      Trail.contentCardToTrail(contentCard)
    }
    val response = OnwardCollectionResponseDCR(tabs, mostCommented, mostShared)
    Cached(900)(JsonComponent.fromWritable(response))
  }

  def jsonResponseTrails(mostPopulars: Seq[MostPopularCollectionResponse], mostCards: Map[String, Option[ContentCard]])(
      implicit request: RequestHeader,
  ): Result = {
    val tabs = mostPopulars.map { tab =>
      OnwardCollectionResponse(tab.heading, tab.trails)
    }
    val mostCommented = mostCards.getOrElse("most_commented", None).flatMap { contentCard =>
      Trail.contentCardToTrail(contentCard)
    }
    val mostShared = mostCards.getOrElse("most_shared", None).flatMap { contentCard =>
      Trail.contentCardToTrail(contentCard)
    }
    val response = OnwardCollectionResponseDCR(tabs, mostCommented, mostShared)
    Cached(900)(JsonComponent.fromWritable(response))
  }

  def jsonResponse(mostPopular: MostPopular, country: Country)(implicit request: RequestHeader): Result = {
    val data = MostPopularGeoResponse(
      country = countryNames.get(country.code),
      heading = mostPopular.heading,
      trails = mostPopular.trails.map(Trail.pressedContentToTrail).take(10),
    )
    Cached(900)(JsonComponent.fromWritable(data))
  }

  def renderPopularDay(countryCode: String): Action[AnyContent] = {
    val country = Country.fromCountryCodeString(countryCode)
    Action { implicit request =>
      Cached(900) {
        JsonComponent(
          "trails" -> JsArray(dayMostPopularAgent.mostPopular(country).map { trail =>
            Json.obj(
              ("url", trail.content.metadata.url),
              ("headline", trail.content.trail.headline),
            )
          }),
        )
      }
    }
  }

  def renderPopularMicroformat2: Action[AnyContent] =
    Action { implicit request =>
      val edition = Edition(request)
      val mostPopular = mostPopularAgent.mostPopular(edition) take 5

      Cached(900) {
        JsonComponent(
          "items" -> JsArray(
            Seq(
              Json.obj(
                "displayName" -> "most viewed",
                "showContent" -> mostPopular.nonEmpty,
                "content" -> JsArray(mostPopular.map(content => isCuratedContent(content.faciaContent))),
              ),
            ),
          ),
        )
      }
    }

  def renderWithDeeplyRead(): Action[AnyContent] =
    Action.async { implicit request =>
      val edition = Edition(request)

      // Synchronous edition popular, from the mostPopularAgent (stateful)
      val editionPopular: Option[MostPopularCollectionResponse] = {
        val editionPopularContent = mostPopularAgent.mostPopular(edition)
        if (editionPopularContent.isEmpty) None
        Some(
          MostPopularCollectionResponse(
            "Most viewed",
            "",
            editionPopularContent
              .map(_.faciaContent)
              .map(Trail.pressedContentToTrail),
          ),
        )
      }

      val deeplyReadItems = deeplyReadAgent.getTrails(edition)

      // Async global deeply read
      val deeplyRead: Option[MostPopularCollectionResponse] = {
        if (deeplyReadItems.isEmpty) None
        Some(
          MostPopularCollectionResponse(
            "Deeply read",
            "",
            deeplyReadItems,
          ),
        )
      }

      val response = (editionPopular, deeplyRead) match {
        case (Some(p), Some(d)) =>
          jsonResponseTrails(editionPopular.toSeq ++ deeplyRead.toSeq, mostCards())
        case (_, _) => NotFound
      }

      Future(response)
    }

  // Get "Most Commented" & "Most Shared" cards for Extended "Most Read" container
  private def mostCards(): Map[String, Option[ContentCard]] =
    mostPopularAgent.mostSingleCardsBox.get().mapV(ContentCard.fromApiContent)

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader): Future[Option[MostPopular]] = {
    log.info(s"Fetching most popular: $path for edition $edition")
    val capiItem = contentApiClient
      .item(path, edition)
      .tag(None)
      .showMostViewed(true)

    val capiItemWithDate =
      if (path == "film") capiItem.dateParam("from-date", Instant.now.minus(180, ChronoUnit.DAYS)) else capiItem

    contentApiClient.getResponse(capiItemWithDate).map { response =>
      val heading = response.section.map(s => "in " + s.webTitle).getOrElse("Across the&nbsp;Guardian")
      val popular = response.mostViewed.getOrElse(Nil) take 10 map (RelatedContentItem(_))
      if (popular.isEmpty) None else Some(MostPopular(heading, path, popular.map(_.faciaContent).toSeq))
    }
  }
}
