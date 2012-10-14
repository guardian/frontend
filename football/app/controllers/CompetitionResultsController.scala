package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import model.Page
import scala.Some
import play.api.templates.Html

object CompetitionResultsController extends Controller with Logging with CompetitionResultFilters {

  val daysToDisplay = 20
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = new Page("http://www.guardian.co.uk/football/matches", "football/results", "football", "", "All results")

  def renderFor(year: String, month: String, day: String, competition: String) = render(
    competition, Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competition: String, date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val filteredCompetitions = Competitions.withCompetitionFilter(competition)

    val resultsDays = filteredCompetitions.withTodaysMatchesAndPastResults.previousMatchDates(startDate, daysToDisplay)

    val results = resultsDays.map { day => MatchesOnDate(day, filteredCompetitions.withMatchesOn(day).competitions) }

    //going forward in time
    val nextPage = filteredCompetitions.withTodaysMatchesAndPastResults.nextMatchDates(startDate.plusDays(1), daysToDisplay)
      .lastOption.map(d => toNextPreviousUrl(d, competition))

    //going backward in time
    val previousPage = resultsDays.lastOption.flatMap { date =>
      filteredCompetitions.withTodaysMatchesAndPastResults.previousMatchDates(date.minusDays(1), daysToDisplay).headOption
    }.map(d => toNextPreviousUrl(d, competition))

    val resultsPage = MatchesPage(page, None, results.filter(_.competitions.nonEmpty),
      nextPage, previousPage, "results", filters)

    if (competitionDoesNotExist(competition)) {
      NotFound("not found")
    } else {
      Cached(page) {
        request.getQueryString("callback").map { callback =>
          JsonComponent(
            "html" -> views.html.fragments.matchesList(resultsPage),
            "more" -> Html(nextPage.getOrElse("")))
        }.getOrElse(Ok(Compressed(views.html.matches(resultsPage))))
      }
    }
  }

  def competitionDoesNotExist(competition: String): Boolean = {
    Competitions.withCompetitionFilter(competition).competitions.isEmpty
  }

  private def toNextPreviousUrl(date: DateMidnight, competition: String) = date match {
    case today if today == DateMidnight.now => "/football/%s/results" format (competition)
    case other => "/football/%s/results/%s" format (competition, other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
