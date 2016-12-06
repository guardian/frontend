package controllers


import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, ExecutionContexts}
import contentapi.ContentApiClient
import model.NoCache
import play.api.Environment
import play.api.mvc.{Action, Controller, RequestHeader, Result}

import scala.concurrent.Future
import scala.concurrent.Future._

trait RendersItemResponse {

  def renderItem(path: String)(implicit request: RequestHeader): Future[Result]

  def canRender(item: ItemResponse): Boolean

  def canRender(path: String): Boolean = false

}

class ItemResponseController(contentApiClient: ContentApiClient, val controllers: RendersItemResponse*) extends Controller with ExecutionContexts {

  def render(path: String) = Action.async{ implicit request =>
    val itemRequest = contentApiClient.item(path, Edition(request))

    controllers.find(_.canRender(path)).map(_.renderItem(path)).getOrElse {
      contentApiClient.getResponse(itemRequest).flatMap { response =>
        controllers.find(_.canRender(response))
          .map(_.renderItem(path))
          .getOrElse(successful(NoCache(NotFound)))
      }
    }
  }
}
