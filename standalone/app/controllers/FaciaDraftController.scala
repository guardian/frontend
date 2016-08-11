package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import controllers.front.FrontJsonFapiDraft
import play.api.mvc.{RequestHeader, Result}
import services.ConfigAgent

import scala.concurrent.Future

class FaciaDraftController(val frontJsonFapi: FrontJsonFapiDraft) extends FaciaController with RendersItemResponse {

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    log.info(s"Serving Path: $path")

    if (!ConfigAgent.getPathIds.contains(path))
    controllers.IndexController.renderItem(path)
    else
    renderFrontPressResult(path)
  }

  override def canRender(path: String): Boolean = ConfigAgent.getPathIds.contains(path)

  override def canRender(item: ItemResponse): Boolean = controllers.IndexController.canRender(item)
}
