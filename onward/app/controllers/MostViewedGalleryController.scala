package controllers

import common._
import feed.MostViewedGalleryAgent
import layout.{CollectionEssentials, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.mvc._
import services.CollectionConfigWithId
import layout.slices.{Fixed, FixedContainers}

class MostViewedGalleryController(
  mostViewedGalleryAgent: MostViewedGalleryAgent,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Logging with ImplicitControllerExecutionContext {

  private val page = SimplePage(MetaData.make(
    "More galleries",
    Some(SectionId.fromId("inpictures")),
    "More galleries"
  ))
  private val dataId: String = "multimedia/gallery"
  private val config = CollectionConfig.empty.copy(
    displayName = Some("More galleries"),
    groups = Some(List("multimedia/gallery"))
  )

  val featuredSeries = Seq(
    ("Photographs of the day", "/news/series/ten-best-photographs-of-the-day"),
    ("Eyewitness", "/world/series/eyewitness"),
    ("From the agencies", "/artanddesign/series/from-the-agencies"),
    ("Sport picture of the day", "/sport/series/sport-picture-of-the-day")
  )

  def renderMostViewed(): Action[AnyContent] = Action { implicit request =>
    getMostViewedGallery match {
      case Nil => Cached(60) { JsonNotFound() }
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
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedMediumSlowVI),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(galleries.map(_.faciaContent), Nil, Some("More galleries"), None, None, None),
        hasMore = false
      ).withTimeStamps,
      FrontProperties.empty
    )

    val htmlResponse = () => views.html.mostViewedGalleries(page, html)
    val jsonResponse = () => html

    renderFormat(htmlResponse, jsonResponse, 900)
  }
}
