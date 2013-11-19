package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached
import feed.{MostRead, MostPopularOnward, OnwardJourneyAgent}
import play.api.libs.json.JsArray

object MostPopularOnwardController extends Controller with Logging with ExecutionContexts {

  def popularOnward(path: String) = Action { implicit request =>

    val onwardContent: Seq[MostPopularOnward] = OnwardJourneyAgent.mostPopularOnward()(path)

    Cached(900) {
      JsonComponent("popularOnward" -> JsArray(onwardContent.map{ onward => TrailToJson(onward.trail) }))
    }
  }

  def mostRead() = Action { implicit request =>

    val mostReadContent: List[MostRead] = OnwardJourneyAgent.mostRead()

    Cached(900) {
      JsonComponent("mostRead" -> mostReadContent.map(_.url).toList)
    }
  }
}
