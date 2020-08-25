package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, ImplicitControllerExecutionContext}
import contentapi.ContentApiClient
import model.NoCache
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.Future._

trait RendersItemResponse {

  def renderItem(path: String)(implicit request: RequestHeader): Future[Result]

  def canRender(item: ItemResponse): Boolean

  def canRender(path: String): Boolean = false

}

class ItemResponseController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    val controllers: RendersItemResponse*,
) extends BaseController
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      val itemRequest = contentApiClient.item(path, Edition(request))

      controllers.find(_.canRender(path)).map(_.renderItem(path)).getOrElse {
        contentApiClient.getResponse(itemRequest).flatMap { response =>
          controllers
            .find(_.canRender(response))
            .map(_.renderItem(path))
            .getOrElse(successful(NoCache(NotFound)))
        }
      }
    }
}
