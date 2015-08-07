package controllers.preview

import controllers.FaciaController
import controllers.front.{FrontJsonFapi, FrontJson}
import services.ConfigAgent

object FrontJsonDraft extends FrontJson {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

object FrontJsonFapiDraft extends FrontJsonFapi {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

object FaciaDraftController extends FaciaController {
  val frontJson: FrontJson = FrontJsonDraft
  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiDraft

  override def renderFront(path: String) = {
    log.info(s"Serving Path: $path")
    if (!ConfigAgent.getPathIds.contains(path))
      controllers.IndexController.render(path)
    else
      renderFrontPress(path)
  }
}
