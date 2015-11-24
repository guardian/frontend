package controllers

import common.{ExecutionContexts, Logging}
import layout.FaciaContainer
import model.{SimplePage, Cached, MetaData}
import play.api.mvc.{Action, Controller}
import services.TodaysNewspaperQuery

object NewspaperController extends Controller with Logging with ExecutionContexts {

  def today() = Action.async { implicit request =>
    val page = SimplePage(MetaData.make(request.path, "News", "Main section | News | The Guardian", "GFE: Newspaper books Main Section"))

    val paper = TodaysNewspaperQuery.fetchTodaysPaper

    val todaysPaper = paper.map(p => TodayNewspaper(page, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.todaysNewspaper(tp)))

  }
}

case class TodayNewspaper(page: SimplePage, bookSections: Seq[FaciaContainer])
