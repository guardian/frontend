package controllers.commercial

import model.commercial.events.MasterclassAgent
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object Masterclasses extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderMasterclasses = MemcachedAction { implicit request =>
    Future.successful {
      (MasterclassAgent.specificMasterclasses(specificIds) ++ MasterclassAgent.masterclassesTargetedAt(segment)).distinct match {
        case Nil => NoCache(jsonFormat.nilResult)
        case masterclasses => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")

          jsonFormat.result(views.html.masterclasses.masterclasses(masterclasses take 4, omnitureId, clickMacro))
        }
      }
    }
  }

}
