package controllers.preview

import controllers.FaciaController
import controllers.front.FrontJson

object FrontJsonDraft extends FrontJson {
  val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}

object FaciaDraftController extends FaciaController {
  val frontJson: FrontJson = FrontJsonDraft
}