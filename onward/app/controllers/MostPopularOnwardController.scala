package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached
import feed.{MostRead, OnwardJourneyAgent}

object MostPopularOnwardController extends Controller with Logging with ExecutionContexts {

  def mostRead() = Action { implicit request =>

    val mostReadContent: List[MostRead] = OnwardJourneyAgent.mostRead()

    Cached(900) {
      JsonComponent("mostRead" -> mostReadContent.map(_.url).toList)
    }
  }
}
