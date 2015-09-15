package controllers

import common.{Edition, InternationalEdition }
import play.api.mvc._
import conf.switches.Switches.InternationalEditionSwitch

object ChangeEditionController extends Controller with PreferenceController {

  def render(editionId: String) = Action { implicit request =>
    fromEdition(editionId).map{ id =>
      switchTo("GU_EDITION" -> id.toUpperCase, pathFor(id))
    }.getOrElse(NotFound)
  }

  private def fromEdition(editionId: String)(implicit request: RequestHeader) = {
    if (InternationalEditionSwitch.isSwitchedOn && editionId == InternationalEdition.id) {
      Some(InternationalEdition.id)
    } else Edition.byId(editionId).map(_.id)
  }

  private def pathFor(editionId: String) = if (editionId == InternationalEdition.id)
    InternationalEdition.path
  else
    s"/${editionId.toLowerCase}"

}
