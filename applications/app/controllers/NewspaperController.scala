package controllers

import common.{ExecutionContexts, Logging}
import layout.FaciaContainer
import model.{Cached, MetaData}
import play.api.mvc.{Action, Controller}
import services.NewspaperQuery

object NewspaperController extends Controller with Logging with ExecutionContexts {

  private val pageId = "theguardian"
  private val section = "todayspaper"
  private val guardianDescription = "Main section | News | The Guardian"

  def latestGuardianNewspaper() = Action.async { implicit request =>

    val page = model.Page(pageId, section, guardianDescription, "GFE: Newspaper books Main Section today")

    val todaysPaper = NewspaperQuery.fetchLatestGuardianNewspaper.map(p => TodayNewspaper(page, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.newspaperPage(tp)))

  }

  def latestObserverNewspaper() = Action.async { implicit request =>
    val page = model.Page(pageId, section, "From the Observer", "GFE: Observer Newspaper books Main Section today")

    val todaysPaper = NewspaperQuery.fetchLatestObserverNewspaper.map(p => TodayNewspaper(page, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.newspaperPage(tp)))

  }

  def forDate(day: String, month: String, year: String) = Action.async { implicit request =>
    val page = model.Page(pageId, section, guardianDescription, "GFE: Newspaper books Main Section for past date")

    val paper = NewspaperQuery.fetchGuardianNewspaperForDate(day, month, year).map(p => TodayNewspaper(page, p))

    for( tp <- paper) yield {
      if(noContentForListExists(tp.bookSections)) Found(s"/theguardian")
      else Cached(900)(Ok(views.html.newspaperPage(tp)))
    }
  }

  def noContentForListExists(booksections: Seq[FaciaContainer]): Boolean = {
    val (frontContainer, otherContainer) = booksections.partition(b => b.displayName == NewspaperQuery.FRONT_PAGE_DISPLAY_NAME)
    frontContainer.flatMap(_.contentItems).isEmpty && otherContainer.flatMap(_.contentItems).isEmpty
  }

  def allOn(day: String, month: String, year: String) = Action {
    Cached(300)(MovedPermanently(s"/theguardian/$year/$month/$day"))
  }
}

case class TodayNewspaper(page: MetaData, bookSections: Seq[FaciaContainer])
