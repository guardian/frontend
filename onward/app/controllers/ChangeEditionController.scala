package controllers

import common.Edition
import model.NoCache
import play.api.mvc._

class ChangeEditionController(val controllerComponents: ControllerComponents)
    extends BaseController
    with PreferenceController {
  def render(editionId: String): Action[AnyContent] =
    Action { implicit request =>
      NoCache(
        Edition
          .byId(editionId)
          .map { edition =>
            val home = edition.homePagePath
            // This INTCMP parameter is simply to cachebust the local cache of browsers
            // For people who switch a lot of editions (mixing going to the page directly and using the edition switcher)
            // the local cache is too long.
            // Using an INTCMP as it follows a familiar pattern & gives extra tracking
            val path = s"$home?INTCMP=CE_${edition.id}"
            switchTo("GU_EDITION" -> edition.id, path)
          }
          .getOrElse(NotFound),
      )
    }
}
