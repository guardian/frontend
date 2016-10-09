package controllers.commercial

import model.commercial.Masterclass
import model.commercial.events.MasterclassAgent
import model.{Cached, NoCache}
import play.api.mvc._

class MasterclassesController(masterclassAgent: MasterclassAgent) extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderMasterclasses = Action { implicit request =>

    val selectedMasterclasses: Seq[Masterclass] =
      (masterclassAgent.specificMasterclasses(specificIds) ++
        masterclassAgent.masterclassesTargetedAt(segment)).distinct

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
