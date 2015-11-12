package controllers

import common.{ExecutionContexts, Logging}
import layout.FaciaContainer
import model.{Cached, MetaData}
import play.api.mvc.{Action, Controller}
import services.NewspaperQuery

object NewspaperController extends Controller with Logging with ExecutionContexts {

  private val section = "News"
  private val description = "Main section | News | The Guardian"

  def today() = Action.async { implicit request =>

    val page = model.Page(request.path, section, description, "GFE: Newspaper books Main Section today")

    val todaysPaper = NewspaperQuery.fetchTodaysPaper.map(p => TodayNewspaper(page, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.newspaperPage(tp)))

  }

  def forDate(day: String, month: String, year: String) = Action.async { implicit request =>
    val page = model.Page(request.path, section, description, "GFE: Newspaper books Main Section for past date")

    val paper = NewspaperQuery.fetchPaperForDate(day, month, year).map(p => TodayNewspaper(page, p))

    for( tp <- paper) yield Cached(900)(Ok(views.html.newspaperPage(tp)))
  }
}

case class TodayNewspaper(page: MetaData, bookSections: Seq[FaciaContainer])
