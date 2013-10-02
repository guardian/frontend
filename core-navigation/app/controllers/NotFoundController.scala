package controllers

import play.api.mvc.{Action, Controller}
import common.{Edition, ExecutionContexts}
import feed.MostPopularAgent
import model.{Page, MostPopular}

object NotFoundController extends Controller with ExecutionContexts {

  val page = Page("", "news", "404", "GFE:404")

  def render404() = Action{ implicit request =>
    val popular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(Edition(request)))
    NotFound(views.html.notFound(page, popular))
  }

}
