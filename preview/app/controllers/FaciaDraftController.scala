package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.TrailsToShowcase
import contentapi.{ContentApiClient, SectionsLookUp}
import controllers.front.FrontJsonFapiDraft
import model.Cached.RevalidatableResult
import model.{ApplicationContext, PressedPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.ConfigAgent

import scala.concurrent.Future

class FaciaDraftController(
    val frontJsonFapi: FrontJsonFapiDraft,
    contentApiClient: ContentApiClient,
    sectionsLookUp: SectionsLookUp,
    val controllerComponents: ControllerComponents,
    val ws: WSClient,
    val remoteRenderer: DotcomRenderingService,
)(implicit val context: ApplicationContext)
    extends FaciaController
    with RendersItemResponse {

  private val indexController = new IndexController(contentApiClient, sectionsLookUp, controllerComponents)

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      indexController.renderItem(path)
    else
      renderFrontPressResult(path)
  }

  override def canRender(path: String): Boolean = ConfigAgent.getPathIds.contains(path)

  override def canRender(item: ItemResponse): Boolean = indexController.canRender(item)

  override protected def renderShowcaseFront(
      faciaPage: PressedPage,
  )(implicit request: RequestHeader): RevalidatableResult = {
    val (rundownPanelOutcomes, singleStoryPanelOutcomes, duplicateMap) = TrailsToShowcase.generatePanelsFrom(faciaPage)
    val html = views.html.showcase(rundownPanelOutcomes, singleStoryPanelOutcomes, duplicateMap)
    RevalidatableResult(Ok(html), html.body)
  }

}
