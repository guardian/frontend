package controllers.commercial

import model.commercial.events.{Masterclass, MasterclassAgent}
import model.{Cached, NoCache}
import play.api.mvc._

class MasterclassesController extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderMasterclasses = Action { implicit request =>

    val selectedMasterclasses: Seq[Masterclass] =
      (MasterclassAgent.specificMasterclasses(specificIds) ++
        MasterclassAgent.masterclassesTargetedAt(segment)).distinct

    selectedMasterclasses match {
      case Nil => NoCache(jsonFormat.nilResult.result)
      case masterclasses => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.masterclasses.masterclasses(masterclasses, omnitureId, clickMacro))
      }
    }
  }
}

object MasterclassesController extends MasterclassesController
