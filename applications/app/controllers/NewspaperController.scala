package controllers

import common.{ExecutionContexts, Logging}
import layout.FaciaContainer
import model.MetaData
import play.api.mvc.{Action, Controller}
import services.TodaysNewspaperQuery

object NewspaperController extends Controller with Logging with ExecutionContexts {
  //todo rename to today?
  //todo this response needs caching
  def index() = Action.async { implicit request =>
    val page = model.Page(request.path, "News", "Main section | News | The Guardian", "Newspaper books Main Section")

    val paper = TodaysNewspaperQuery.fetchTodaysPaper

    val todaysPaper = paper.map(p => TodayNewspaper(page, p))

    for( tp <- todaysPaper) yield Ok(views.html.todaysNewspaper(tp))

  }
}

case class TodayNewspaper(page: MetaData, bookSections: Seq[FaciaContainer])
