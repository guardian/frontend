package controllers.commercial

import model.commercial.masterclasses.MasterClassAgent
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object MasterClasses extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderMasterclasses = MemcachedAction { implicit request =>
    Future.successful {
      (MasterClassAgent.specificClasses(specificIds) ++ MasterClassAgent.masterclassesTargetedAt(segment)).distinct match {
        case Nil => NoCache(jsonFormat.nilResult)
        case masterclasses => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")

          jsonFormat.result(views.html.masterClasses.masterClasses(masterclasses, omnitureId, clickMacro))
        }
      }
    }
  }

}
