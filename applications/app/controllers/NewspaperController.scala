package controllers

import common.{ExecutionContexts, Logging}
import layout.FaciaContainer
import model.{SimplePage, Cached, MetaData}
import play.api.mvc.{Action, Controller}
import services.NewspaperQuery

object NewspaperController extends Controller with Logging with ExecutionContexts {

  def latestGuardianNewspaper() = Action.async { implicit request =>

    val guardianPage = SimplePage(MetaData.make("theguardian", "todayspaper", "Main section | News | The Guardian", "GFE: Newspaper books Main Section"))
    val todaysPaper = NewspaperQuery.fetchLatestGuardianNewspaper.map(p => TodayNewspaper(guardianPage, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.newspaperPage(tp)))

  }

  def latestObserverNewspaper() = Action.async { implicit request =>
    val observerPage = SimplePage(MetaData.make("theobserver", "theobserver", "Main section | From the Observer | The Guardian", "GFE: Observer Newspaper books Main Section"))

    val todaysPaper = NewspaperQuery.fetchLatestObserverNewspaper.map(p => TodayNewspaper(observerPage, p))

    for( tp <- todaysPaper) yield Cached(300)(Ok(views.html.newspaperPage(tp)))

  }

  def newspaperForDate(path: String, day: String, month: String, year: String) = Action.async { implicit request =>

    val page = path match {
      case "theguardian" => SimplePage(MetaData.make("theguardian", "todayspaper", "Top Stories | From the Guardian | The Guardian", "GFE: Newspaper books Top Stories"))
      case "theobserver" => SimplePage(MetaData.make("theobserver", "theobserver", "News | From the Observer | The Guardian", "GFE: Observer Newspaper books Top Stories"))
    }

    val paper = NewspaperQuery.fetchNewspaperForDate(path, day, month, year).map(p => TodayNewspaper(page, p))

    for( tp <- paper) yield {
      if(noContentForListExists(tp.bookSections)) Found(s"/$path")
      else Cached(900)(Ok(views.html.newspaperPage(tp)))
    }
  }

  def noContentForListExists(booksections: Seq[FaciaContainer]): Boolean = {
    val (frontContainer, otherContainer) = booksections.partition(b => b.displayName == NewspaperQuery.FRONT_PAGE_DISPLAY_NAME)
    frontContainer.flatMap(_.items).isEmpty && otherContainer.flatMap(_.items).isEmpty
  }

  def allOn(path: String, day: String, month: String, year: String) = Action {
    Cached(300)(MovedPermanently(s"/$path/$year/$month/$day"))
  }
}

case class TodayNewspaper(page: SimplePage, bookSections: Seq[FaciaContainer])
