package controllers

import common._
import feed.{ CompetitionSupport, Competitions }
import play.api.mvc.{ RequestHeader, Action, Controller }
import model._
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import model.Page
import scala.Some
import play.api.templates.Html

sealed trait ResultsRenderer extends Controller with Logging with CompetitionResultFilters {

  val daysToDisplay = 3
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderResults(page: Page,
    competitions: CompetitionSupport,
    competitionName: Option[String],
    date: Option[DateMidnight])(implicit request: RequestHeader) = {
    val startDate = date.getOrElse(new DateMidnight)

    val resultsDays = competitions.previousMatchDates(startDate, daysToDisplay)

    val results = resultsDays.map { day => MatchesOnDate(day, competitions.withMatchesOn(day).competitions) }

    val nextPage = competitions.nextMatchDates(startDate.plusDays(1), daysToDisplay)
      .lastOption.map(toNextPreviousUrl(_, competitionName))

    val previousPage = resultsDays.lastOption.flatMap { date =>
      competitions.previousMatchDates(date.minusDays(1), daysToDisplay).headOption
    }.map(toNextPreviousUrl(_, competitionName))

    val resultsPage = MatchesPage(page, None, results.filter(_.competitions.nonEmpty),
      nextPage, previousPage, "results", filters)

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(
          "html" -> views.html.fragments.matchesList(resultsPage),
          "more" -> Html(previousPage.getOrElse("")))
      }.getOrElse(Ok(Compressed(views.html.matches(resultsPage))))
    }
  }

  def toNextPreviousUrl(date: DateMidnight, competition: Option[String]): String

}

object ResultsController extends ResultsRenderer with Logging {

  val page = new Page("http://www.guardian.co.uk/football/matches", "football/results", "football", "", "All results")

  def renderFor(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(date: Option[DateMidnight] = None) = Action { implicit request =>
    renderResults(page, Competitions.withTodaysMatchesAndPastResults, None, date)
  }

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/results"
    case other => "/football/results/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object CompetitionResultsController extends ResultsRenderer with Logging {

  override val daysToDisplay = 20

  def renderFor(year: String, month: String, day: String, competition: String) = render(
    competition, Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competitionName: String, date: Option[DateMidnight] = None) = Action { implicit request =>

    Competitions.competitions.find(_.url.endsWith(competitionName)).map { competition =>
      val page = new Page("http://www.guardian.co.uk/football/matches", competition.url.drop(1) + "/results",
        "football", "", competition.fullName + " results")
      renderResults(page,
        Competitions.withTodaysMatchesAndPastResults.withCompetitionFilter(competitionName),
        Some(competitionName), date)
    }.getOrElse(NotFound)

  }

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/%s/results" format (competition.get)
    case other => "/football/%s/results/%s" format (competition.get, other.toString("yyyy/MMM/dd").toLowerCase)
  }
}