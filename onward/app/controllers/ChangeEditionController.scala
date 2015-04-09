package controllers

import common.{Edition, InternationalEdition }
import play.api.mvc._
import conf.Switches.InternationalEditionSwitch

object ChangeEditionController extends Controller with PreferenceController {

  def render(editionId: String) = Action { implicit request =>
    fromEdition(editionId).map{
      case InternationalEdition.id => switchTo("GU_EDITION" -> InternationalEdition.id.toUpperCase, InternationalEdition.path)
      case id => switchTo("GU_EDITION" -> id.toUpperCase, s"/${id.toLowerCase}")
    }.getOrElse(NotFound)
  }

  private def fromEdition(editionId: String)(implicit request: RequestHeader) = {
    if (InternationalEditionSwitch.isSwitchedOn && editionId == InternationalEdition.id) {
      Some(InternationalEdition.id)
    } else Edition.byId(editionId).map(_.id)
  }

}
