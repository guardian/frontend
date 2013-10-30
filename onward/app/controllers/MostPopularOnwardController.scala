package controllers

import common._
import play.api.mvc.{Action, Controller}
import model.Cached
import feed.{MostRead, OnwardJourneyAgent}

object MostPopularOnwardController extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action { implicit request =>

    val mostPopular = OnwardJourneyAgent.mostPopular()
    val popular: Option[MostRead] = mostPopular.get(path)

    Cached(900) {
        JsonComponent("popularity" -> popular.map(_.count).getOrElse(s"$path url not found"),
                      "mostPopular" -> mostPopular.toList.sortBy(_._2.count).take(3).map(_._2.url))
    }
  }
}
