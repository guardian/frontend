package controllers.preview

import controllers.FaciaController
import controllers.front.{FrontJson, FrontJsonDraft}

object FaciaDraftController extends FaciaController {
  val frontJson: FrontJson = FrontJsonDraft
}