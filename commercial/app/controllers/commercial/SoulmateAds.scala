package controllers.commercial

import model.commercial.soulmates._
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

object SoulmateAds extends Controller with implicits.Requests {

  def renderSoulmates = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers match {
        case Nil => NoCache(jsonFormat.nilResult)
        case members => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          jsonFormat.result(views.html.soulmates.soulmates(members, omnitureId, clickMacro))
        }
      }
    }
  }
}
