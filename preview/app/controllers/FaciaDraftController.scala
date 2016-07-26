package controllers.preview

import controllers.FaciaController
import controllers.front.FrontJsonFapi
import play.api.libs.ws.WSClient
import services.ConfigAgent

case class FrontJsonFapiDraft(val wsClient: WSClient) extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

case class FaciaDraftController(val frontJsonFapi: FrontJsonFapi) extends FaciaController {

  override def renderFront(path: String) = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      controllers.IndexController.render(path)
    else
      renderFrontPress(path)
  }
}
