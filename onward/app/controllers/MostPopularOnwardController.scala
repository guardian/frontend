package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached
import feed.{MostRead, MostPopularOnward, OnwardJourneyAgent}

object MostPopularOnwardController extends Controller with Logging with ExecutionContexts {

  def popularOnward(path: String) = Action { implicit request =>

    val onwardContent: Seq[MostPopularOnward] = OnwardJourneyAgent.mostPopularOnward()(path)

    Cached(900) {
      JsonComponent("popularOnward" -> onwardContent.map(_.url).toList)
    }
  }

  def mostRead() = Action { implicit request =>

    val mostReadContent: List[MostRead] = OnwardJourneyAgent.mostRead()

    Cached(900) {
      JsonComponent("mostRead" -> mostReadContent.map(_.url).toList)
    }
  }
}
