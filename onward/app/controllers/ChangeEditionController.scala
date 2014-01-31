package controllers

import common.Edition
import play.api.mvc._

object ChangeEditionController extends Controller with PreferenceController {

  def render(editionId: String) = Action { implicit request =>
    Edition.byId(editionId).map{ edition =>
      switchTo("GU_EDITION" -> edition.id.toUpperCase, s"/${edition.id.toLowerCase}")
    }.getOrElse(NotFound)
  }
}