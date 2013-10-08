package controllers

import play.api.mvc.{Action, Controller}
import common.{Edition, ExecutionContexts}
import feed.MostPopularAgent
import model.{Page, MostPopular}

object NotFoundController extends Controller with ExecutionContexts {

  val page = new Page("404", "uk", "404", "GFE:404 error page") {
    override def metaData = super.metaData + ("content-type" -> "errorPage")
  }

  def render404() = Action{ implicit request =>
    NotFound(views.html.notFound(page, MostPopularAgent.mostPopular(Edition(request))))
  }
}
