package controllers.preview

import contentapi.SectionsLookUp
import controllers.{FaciaController, IndexController}
import controllers.front.FrontJsonFapi
import play.api.libs.ws.WSClient
import services.ConfigAgent

class FrontJsonFapiDraft(val wsClient: WSClient) extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

class FaciaDraftController(val frontJsonFapi: FrontJsonFapi, sectionsLookUp: SectionsLookUp) extends FaciaController {

  private val indexController = new IndexController(sectionsLookUp)

  override def renderFront(path: String) = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      indexController.render(path)
    else
      renderFrontPress(path)
  }
}
