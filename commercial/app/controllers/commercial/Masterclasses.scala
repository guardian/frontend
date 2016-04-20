package controllers.commercial

import model.commercial.events.{Masterclass, MasterclassAgent}
import model.{Cached, NoCache}
import play.api.mvc._

import scala.concurrent.Future

object Masterclasses extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderMasterclasses = Action.async { implicit request =>
    Future.successful {

      val selectedMasterclasses: Seq[Masterclass] = (MasterclassAgent.specificMasterclasses(specificIds) ++
                                             MasterclassAgent.masterclassesTargetedAt(segment)).distinct
      selectedMasterclasses.toList match {
        case Nil => NoCache(jsonFormat.nilResult)
        case masterclasses => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")

          if(conf.switches.Switches.v2MasterclassesTemplate.isSwitchedOn) {
            jsonFormat.result(views.html.masterclasses.masterclassesV2(masterclasses, omnitureId, clickMacro))
          } else {
            jsonFormat.result(views.html.masterclasses.masterclasses(masterclasses, omnitureId, clickMacro))
          }
        }
      }
    }
  }

}
