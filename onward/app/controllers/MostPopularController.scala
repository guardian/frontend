package controllers

import common._
import contentapi.ContentApiClient
import feed.{DayMostPopularAgent, GeoMostPopularAgent, MostPopularAgent}
import model.Cached.RevalidatableResult
import model._
import model.pressed.PressedContent
import play.api.libs.json._
import play.api.mvc._
import views.support.{ContentOldAgeDescriber, ImgSrc, RemoveOuterParaHtml}
import views.support.FaciaToMicroFormat2Helpers._

import scala.concurrent.Future

case class MostPopularItem(
  url: String,
  linkText: String,
  showByline: Boolean,
  byline: Option[String],
  image: Option[String],
  ageWarning: Option[String],
  isLiveBlog: Boolean
)

case class MostPopularGeoResponse(
  country: Option[String],
  heading: String,
  trails: Seq[MostPopularItem]
)

case class MostPopularResponse(
  heading: String,
  trails: Seq[MostPopularItem]
)

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
        case popular if request.isGuui => jsonResponse(popular)
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
    "IN" -> "India"
  )

  implicit val itemWrites = Json.writes[MostPopularItem]
  implicit val geoWrites = Json.writes[MostPopularGeoResponse]
  implicit val popularWrites = Json.writes[MostPopularResponse]
  import implicits.FaciaContentFrontendHelpers._

  def renderPopularGeo(): Action[AnyContent] = Action { implicit request =>
    val headers = request.headers.toSimpleMap
    val countryCode = headers.getOrElse("X-GU-GeoLocation","country:row").replace("country:","")

    val countryPopular = MostPopular("across the guardian", "", geoMostPopularAgent.mostPopular(countryCode).map(_.faciaContent))

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
      MostPopularResponse(
        heading = section.heading,
        trails = trailsToItems(section.trails)
      )
    }

    Cached(900)(JsonComponent(responses))
  }

  def jsonResponse(mostPopular: MostPopular, countryCode: String)(implicit request: RequestHeader): Result = {
    val data = MostPopularGeoResponse(
      country = countryNames.get(countryCode),
      heading = mostPopular.heading,
      trails = trailsToItems(mostPopular.trails)
    )

    Cached(900)(JsonComponent(data))
  }

  private[this] def trailsToItems(trails: Seq[PressedContent])(implicit request: RequestHeader): Seq[MostPopularItem] = {
    def ageWarning(content: PressedContent): Option[String] = {
      content.properties.maybeContent
        .filter(c => c.tags.tags.exists(_.id == "tone/news"))
        .map(ContentOldAgeDescriber.apply)
        .filterNot(_ == "")
    }

    trails.take(10).map(content =>
      MostPopularItem(
        url = LinkTo(content.header.url),
        linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.properties.webTitle)).body,
        showByline = content.properties.showByline,
        byline = content.properties.byline,
        image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
        ageWarning = ageWarning(content),
        isLiveBlog = false
      )
    )
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
    contentApiClient.getResponse(contentApiClient.item(path, edition)
      .tag(None)
      .showMostViewed(true)
    ).map{response =>
      val heading = response.section.map(s => "in " + s.webTitle.toLowerCase).getOrElse("across the guardian")
          val popular = response.mostViewed.getOrElse(Nil) take 10 map { RelatedContentItem(_) }
          if (popular.isEmpty) None else Some(MostPopular(heading, path, popular.map(_.faciaContent)))
    }
  }
}
