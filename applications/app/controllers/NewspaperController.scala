package controllers

import common.{ImplicitControllerExecutionContext, GuLogging}
import contentapi.ContentApiClient
import layout.FaciaContainer
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{ApplicationContext, Cached, MetaData, SectionId, SimplePage, StandalonePage}
import pages.ContentHtmlPage
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.NewspaperQuery

class NewspaperController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val newspaperQuery = new NewspaperQuery(contentApiClient)

  def latestGuardianNewspaper(): Action[AnyContent] =
    Action.async { implicit request =>
      val metadata = MetaData.make(
        "theguardian",
        Some(SectionId.fromId("todayspaper")),
        "Main section | News | The Guardian",
      )
      val todaysPaper = newspaperQuery
        .fetchLatestGuardianNewspaper()
        .map(frontContainers => TodayNewspaper(metadata, frontContainers))

      for (tp <- todaysPaper) yield Cached(300)(RevalidatableResult.Ok(ContentHtmlPage.html(tp)))

    }

  def latestObserverNewspaper(): Action[AnyContent] = {
    // A request was made by Central Production on the 12th July 2022 to redirect this page to
    // /observer rather than create a generated page here.
    // Issue: https://github.com/guardian/frontend/issues/25223
    Action { implicit request =>
      Cached(300)(WithoutRevalidationResult(MovedPermanently("/observer")))
    }
  }

  def newspaperForDate(path: String, day: String, month: String, year: String): Action[AnyContent] =
    Action.async { implicit request =>
      val metadata = path match {
        case "theguardian" =>
          MetaData.make(
            "theguardian",
            Some(SectionId.fromId("todayspaper")),
            "Top Stories | From the Guardian | The Guardian",
          )
        case "theobserver" =>
          MetaData.make(
            "theobserver",
            Some(SectionId.fromId("theobserver")),
            "News | From the Observer | The Guardian",
          )
      }

      val paper = newspaperQuery
        .fetchNewspaperForDate(path, day, month, year)
        .map(frontContainers => TodayNewspaper(metadata, frontContainers))

      for (tp <- paper) yield {
        if (noContentForListExists(tp.bookSections)) Found(s"/$path")
        else Cached(900)(RevalidatableResult.Ok(ContentHtmlPage.html(tp)))
      }
    }

  def noContentForListExists(booksections: Seq[FaciaContainer]): Boolean = {
    val (frontContainer, otherContainer) =
      booksections.partition(b => b.displayName.contains(newspaperQuery.FRONT_PAGE_DISPLAY_NAME))
    frontContainer.flatMap(_.items).isEmpty && otherContainer.flatMap(_.items).isEmpty
  }

  def allOn(path: String, day: String, month: String, year: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(300)(WithoutRevalidationResult(MovedPermanently(s"/$path/$year/$month/$day")))
    }
}

case class TodayNewspaper(metadata: MetaData, bookSections: Seq[FaciaContainer]) extends StandalonePage
