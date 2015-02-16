package controllers

import com.gu.contentapi.client.model.ItemResponse
import controllers.front.FrontJson
import play.api.mvc.{RequestHeader, Result}
import services.ConfigAgent

import scala.concurrent.Future

object FrontJsonDraft extends FrontJson {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

object FaciaDraftController extends FaciaController with RendersItemResponse {
  val frontJson: FrontJson = FrontJsonDraft


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
