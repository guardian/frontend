package controllers

import com.gu.facia.api.models.{GroupConfig, GroupsConfig}
import common.{JsonComponent, _}
import feed.MostViewedGalleryAgent
import layout.{CollectionEssentials, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.mvc._
import services.CollectionConfigWithId
import layout.slices.{Fixed, FixedContainers}
import model.dotcomrendering.{OnwardCollectionResponse, Trail}

import scala.concurrent.duration.DurationInt

class MostViewedGalleryController(
    mostViewedGalleryAgent: MostViewedGalleryAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val MostGalleriesLabel: String = "More galleries"
  private val page = SimplePage(
    MetaData.make(
      MostGalleriesLabel,
      Some(SectionId.fromId("inpictures")),
      MostGalleriesLabel,
    ),
  )
  private val dataId: String = "multimedia/gallery"
  private val config = CollectionConfig.empty.copy(
    displayName = Some(MostGalleriesLabel),
    groupsConfig = Some(
      GroupsConfig(
        List(
          GroupConfig(
            name = "multimedia/gallery",
            maxItems = None,
          ),
        ),
      ),
    ),
  )

  val featuredSeries = Seq(
    ("Photographs of the day", "/news/series/ten-best-photographs-of-the-day"),
    ("Eyewitness", "/world/series/eyewitness"),
    ("From the agencies", "/artanddesign/series/from-the-agencies"),
    ("Sport picture of the day", "/sport/series/sport-picture-of-the-day"),
  )

  def renderMostViewed(): Action[AnyContent] =
    Action { implicit request =>
      getMostViewedGallery() match {
        case Nil => Cached(15) { JsonNotFound() }
        case galleries if request.forceDCR =>
          val data = OnwardCollectionResponse(
            heading = MostGalleriesLabel,
            trails = galleries.map(_.faciaContent).map(Trail.pressedContentToTrail).take(10),
          )
          Cached(30.minutes)(JsonComponent.fromWritable(data))
        case galleries => renderMostViewedGallery(galleries)
      }
    }
  def renderMostViewedHtml(): Action[AnyContent] = renderMostViewed()

  private def getMostViewedGallery()(implicit request: RequestHeader): List[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("6").toInt
    mostViewedGalleryAgent.mostViewedGalleries().take(size).toList
  }

  private def renderMostViewedGallery(galleries: Seq[RelatedContentItem])(implicit request: RequestHeader): Result = {
    val html = views.html.fragments.containers.facia_cards.container(
      FaciaContainer
        .fromConfigWithId(
          1,
          Fixed(FixedContainers.fixedMediumSlowVI),
          CollectionConfigWithId(dataId, config),
          CollectionEssentials(
            galleries.map(_.faciaContent),
            Nil,
            Some(MostGalleriesLabel),
            Some("inpictures/all"),
            None,
            None,
          ),
          hasMore = false,
        )
        .withTimeStamps,
      FrontProperties.empty,
    )

    val htmlResponse = () => views.html.mostViewedGalleries(page, html)
    val jsonResponse = () => html

    renderFormat(htmlResponse, jsonResponse, 900)
  }
}
