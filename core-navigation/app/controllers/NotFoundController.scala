package controllers

import play.api.mvc.{Action, Controller}
import common.{Edition, ExecutionContexts}
import feed.MostPopularAgent
import model.{Page, MostPopular}

object NotFoundController extends Controller with ExecutionContexts {

<<<<<<< HEAD
  val page = new Page("404", "news", "404", "GFE:404 error page") {
    override def metaData = super.metaData + ("content-type" -> "errorPage")
  }

  def render404() = Action{ implicit request =>
    NotFound(views.html.notFound(page, MostPopularAgent.mostPopular(Edition(request))))
=======
  val page = Page("", "news", "404", "GFE:404")

  def render404() = Action{ implicit request =>
    val popular = MostPopular("The Guardian", "", MostPopularAgent.mostPopular(Edition(request)))
    NotFound(views.html.notFound(page, popular))
>>>>>>> 8ad9d307fa0795992aec04d4905a01fa868877bf
  }

}
