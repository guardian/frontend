package controllers

import common._
import feed.MostViewedGalleryAgent
import layout.{CollectionEssentials, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.mvc.{Action, Controller, RequestHeader}
import services.CollectionConfigWithId
import layout.slices.{Fixed, FixedContainers}

class MostViewedGalleryController(mostViewedGalleryAgent: MostViewedGalleryAgent)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  private val page = SimplePage(MetaData.make(
    "more galleries",
    Some(SectionSummary.fromId("inpictures")),
    "more galleries"
  ))
  private val dataId: String = "multimedia/gallery"
  private val config = CollectionConfig.empty.copy(
    displayName = Some("more galleries"),
    groups = Some(List("multimedia/gallery"))
  )

  val featuredSeries = Seq(
    ("Photographs of the day", "/news/series/ten-best-photographs-of-the-day"),
    ("Eyewitness", "/world/series/eyewitness"),
    ("From the agencies", "/artanddesign/series/from-the-agencies"),
    ("Sport picture of the day", "/sport/series/sport-picture-of-the-day")
  )

  def renderMostViewed() = Action { implicit request =>
    getMostViewedGallery match {
      case Nil => Cached(60) { JsonNotFound() }
      case galleries => renderMostViewedGallery(galleries)
    }
  }
  def renderMostViewedHtml() = renderMostViewed()

  private def getMostViewedGallery()(implicit request: RequestHeader): List[RelatedContentItem] = {
    val size = request.getQueryString("size").getOrElse("6").toInt
    mostViewedGalleryAgent.mostViewedGalleries().take(size).toList
  }

  private def renderMostViewedGallery(galleries: Seq[RelatedContentItem])(implicit request: RequestHeader) = {
    val html = views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedMediumSlowVI),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(galleries.map(_.faciaContent), Nil, Some("more galleries"), None, None, None)
      ).withTimeStamps,
      FrontProperties.empty
    )

    val htmlResponse = () => views.html.mostViewedGalleries(page, html)
    val jsonResponse = () => html

    renderFormat(htmlResponse, jsonResponse, 900)
  }
}
