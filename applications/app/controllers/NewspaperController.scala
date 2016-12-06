package controllers

import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import layout.FaciaContainer
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{Cached, MetaData, SectionSummary, SimplePage}
import play.api.Environment
import play.api.mvc.{Action, Controller}
import services.NewspaperQuery

class NewspaperController(contentApiClient: ContentApiClient)(implicit env: Environment) extends Controller with Logging with ExecutionContexts {

  private val newspaperQuery = new NewspaperQuery(contentApiClient)

  def latestGuardianNewspaper() = Action.async { implicit request =>

    val guardianPage = SimplePage(MetaData.make(
      "theguardian",
      Some(SectionSummary.fromId("todayspaper")),
      "Main section | News | The Guardian"
    ))
    val todaysPaper = newspaperQuery.fetchLatestGuardianNewspaper.map(p => TodayNewspaper(guardianPage, p))

    for( tp <- todaysPaper) yield Cached(300)(RevalidatableResult.Ok(views.html.newspaperPage(tp)))

  }

  def latestObserverNewspaper() = Action.async { implicit request =>
    val observerPage = SimplePage(MetaData.make(
      "theobserver",
      Some(SectionSummary.fromId("theobserver")),
      "Main section | From the Observer | The Guardian"
    ))

    val todaysPaper = newspaperQuery.fetchLatestObserverNewspaper.map(p => TodayNewspaper(observerPage, p))

    for( tp <- todaysPaper) yield Cached(300)(RevalidatableResult.Ok(views.html.newspaperPage(tp)))

  }

  def newspaperForDate(path: String, day: String, month: String, year: String) = Action.async { implicit request =>

    val page = path match {
      case "theguardian" => SimplePage(MetaData.make(
        "theguardian",
        Some(SectionSummary.fromId("todayspaper")),
        "Top Stories | From the Guardian | The Guardian"
      ))
      case "theobserver" => SimplePage(MetaData.make(
        "theobserver",
        Some(SectionSummary.fromId("theobserver")),
        "News | From the Observer | The Guardian"
      ))
    }

    val paper = newspaperQuery.fetchNewspaperForDate(path, day, month, year).map(p => TodayNewspaper(page, p))

    for( tp <- paper) yield {
      if(noContentForListExists(tp.bookSections)) Found(s"/$path")
      else Cached(900)(RevalidatableResult.Ok(views.html.newspaperPage(tp)))
    }
  }

  def noContentForListExists(booksections: Seq[FaciaContainer]): Boolean = {
    val (frontContainer, otherContainer) = booksections.partition(b => b.displayName.contains(newspaperQuery.FRONT_PAGE_DISPLAY_NAME))
    frontContainer.flatMap(_.items).isEmpty && otherContainer.flatMap(_.items).isEmpty
  }

  def allOn(path: String, day: String, month: String, year: String) = Action { implicit request =>
    Cached(300)(WithoutRevalidationResult(MovedPermanently(s"/$path/$year/$month/$day")))
  }
}

case class TodayNewspaper(page: SimplePage, bookSections: Seq[FaciaContainer])
