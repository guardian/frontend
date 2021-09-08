package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.TrailsToShowcase
import contentapi.{ContentApiClient, SectionsLookUp}
import controllers.front.FrontJsonFapiDraft
import model.{ApplicationContext, PressedPage}
import play.api.mvc._
import services.ConfigAgent

import scala.concurrent.Future

class FaciaDraftController(
    val frontJsonFapi: FrontJsonFapiDraft,
    contentApiClient: ContentApiClient,
    sectionsLookUp: SectionsLookUp,
    val controllerComponents: ControllerComponents,
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

  override def renderFrontShowcase(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      frontJsonFapi.get(path, liteRequestType).map {
        case Some(faciaPage: PressedPage) => {
          (for {
            // We are using the presence of the Showcase collections to decide if this front is a Showcase feed
            singleStoriesCollection <- faciaPage.collections.find(_.displayName == "Standalone")
            rundownStoriesCollection <- faciaPage.collections.find(_.displayName == "Rundown")
          } yield {
            val singleStoryPanelCreationOutcomes =
              singleStoriesCollection.curated.map(TrailsToShowcase.asSingleStoryPanel)
            val singleStoryPanels = singleStoryPanelCreationOutcomes.flatMap(_.toOption)
            val problems = singleStoryPanelCreationOutcomes.flatMap(_.left.toOption)

            val rundownPanel = TrailsToShowcase.asRundownPanel(
              rundownStoriesCollection.displayName,
              rundownStoriesCollection.curated,
              rundownStoriesCollection.id,
            )

            Ok(views.html.showcase(singleStoryPanels, rundownPanel, problems))

          }).getOrElse {
            // Not a Showcase front
            NotFound
          }
        }
        case _ =>
          NotFound
      }
    }

}
