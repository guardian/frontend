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

object ResultsController extends Controller with Logging {

  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = Page("http://www.guardian.co.uk/football/matches", "football/results", "football", "", "All results")

  def allCompetitionsOn(year: String, month: String, day: String) = allCompetitions(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def allCompetitions(date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val resultsDays = Competitions.lastThreeResultsDatesEnding(startDate)

    val results = resultsDays.map { day => MatchesOnDate(day, Competitions.withFixturesOrResultsOn(day)) }

    val nextPage = findNextDateWithResults(startDate)

    val previousPage = findPreviousDateWithResults(resultsDays.lastOption)

    val fixturesPage = MatchesPage(page, results.filter(_.competitions.nonEmpty), nextPage, previousPage, "results")

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(
          "html" -> views.html.fragments.matchesList(fixturesPage),
          "more" -> Html(nextPage.getOrElse("")))
      }.getOrElse(Ok(views.html.matches(fixturesPage)))
    }
  }

  def findNextDateWithResults(date: DateMidnight) =
    Competitions.nextThreeResultsDatesStarting(date.plusDays(1)).lastOption.map(toNextPreviousUrl)

  private def findPreviousDateWithResults(date: Option[DateMidnight]) = date.flatMap(lastDate =>
    Competitions.lastThreeResultsDatesEnding(lastDate.minusDays(1)).headOption.map(toNextPreviousUrl)
  )

  private def toNextPreviousUrl(date: DateMidnight) = date match {
    case today if today == DateMidnight.now => "/football/results"
    case other => "/football/results/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}