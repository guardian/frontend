package controllers

import common.Edition
import model.NoCache
import play.api.mvc._

object ChangeEditionController extends Controller with PreferenceController {

  def render(editionId: String) = Action { implicit request =>
    NoCache(Edition.byId(editionId).map{ edition =>
      switchTo("GU_EDITION" -> edition.id, edition.homePagePath)
    }.getOrElse(NotFound))
  }


}
