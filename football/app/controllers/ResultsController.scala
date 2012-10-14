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

object ResultsController extends Controller with Logging with CompetitionResultFilters {

  val daysToDisplay = 3
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = new Page("http://www.guardian.co.uk/football/matches", "football/results", "football", "", "All results")

  def allCompetitionsOn(year: String, month: String, day: String) = allCompetitions(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def allCompetitions(date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val resultsDays = (Seq(startDate) ++ Competitions.withResultsOnly.previousMatchDates(startDate, daysToDisplay)).distinct

    val results = resultsDays.map { day => MatchesOnDate(day, Competitions.withMatchesOn(day).competitions) }

    //going forward in time
    val nextPage = Competitions.withResultsOnly.nextMatchDates(startDate.plusDays(1), daysToDisplay)
      .lastOption.map(toNextPreviousUrl)

    //going backward in time
    val previousPage = resultsDays.lastOption.flatMap { date =>
      Competitions.withResultsOnly.previousMatchDates(date.minusDays(1), daysToDisplay).headOption
    }.map(toNextPreviousUrl)

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

  private def toNextPreviousUrl(date: DateMidnight) = date match {
    case today if today == DateMidnight.now => "/football/results"
    case other => "/football/results/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}