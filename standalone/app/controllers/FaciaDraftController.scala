package controllers

import com.gu.contentapi.client.model.ItemResponse
import controllers.front.FrontJsonFapi
import play.api.mvc.{RequestHeader, Result}
import services.ConfigAgent

import scala.concurrent.Future

object FrontJsonFapiDraft extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

object FaciaDraftController extends FaciaController with RendersItemResponse {
  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiDraft

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
