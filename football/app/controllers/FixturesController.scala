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

object FixturesController extends Controller with Logging with CompetitionFixtureFilters {

  val daysToDisplay = 3

  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = new Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "All fixtures")

  def allCompetitionsOn(year: String, month: String, day: String) = allCompetitions(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def allCompetitions(date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val fixtureDays = Competitions.withFixturesOnly.nextMatchDates(startDate, daysToDisplay)

    val fixtures = fixtureDays.map { day => MatchesOnDate(day, Competitions.withMatchesOn(day).competitions) }

    val nextPage = fixtureDays.lastOption.flatMap { date =>
      Competitions.withFixturesOnly.nextMatchDates(date.plusDays(1), daysToDisplay).headOption
    }.map(toNextPreviousUrl)

    val previousPage = Competitions.withFixturesOnly.previousMatchDates(startDate.minusDays(1), daysToDisplay)
      .lastOption.map(toNextPreviousUrl)

    val fixturesPage = MatchesPage(page, None, fixtures.filter(_.competitions.nonEmpty),
      nextPage, previousPage, "fixtures", filters)

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(
          "html" -> views.html.fragments.matchesList(fixturesPage),
          "more" -> Html(nextPage.getOrElse("")))
      }.getOrElse(Ok(views.html.matches(fixturesPage)))
    }
  }

  private def toNextPreviousUrl(date: DateMidnight) = date match {
    case today if today == DateMidnight.now => "/football/fixtures"
    case other => "/football/fixtures/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
