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

object CompetitionFixturesController extends Controller with Logging with CompetitionFixtureFilters {

  val daysToDisplay = 20
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = new Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "All fixtures")

  def renderFor(year: String, month: String, day: String, competition: String) = render(
    competition, Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competition: String, date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val filteredCompetitions = Competitions.withCompetitionFilter(competition)

    val fixtureDays = (Seq(startDate) ++ filteredCompetitions.withFixturesOnly.nextMatchDates(startDate, daysToDisplay)).distinct

    val fixtures = fixtureDays.map { day => MatchesOnDate(day, filteredCompetitions.withMatchesOn(day).competitions) }

    val nextPage = fixtureDays.lastOption.flatMap { date =>
      filteredCompetitions.withFixturesOnly.nextMatchDates(date.plusDays(1), daysToDisplay).headOption
    }.map(d => toNextPreviousUrl(d, competition))

    val previousPage = filteredCompetitions.withFixturesOnly.previousMatchDates(startDate.minusDays(1), daysToDisplay)
      .lastOption.map(d => toNextPreviousUrl(d, competition))

    val fixturesPage = MatchesPage(page, None, fixtures.filter(_.competitions.nonEmpty),
      nextPage, previousPage, "fixtures", filters)

    if (competitionDoesNotExist(competition)) {
      NotFound("not found")
    } else {
      Cached(page) {
        request.getQueryString("callback").map { callback =>
          JsonComponent(
            "html" -> views.html.fragments.matchesList(fixturesPage),
            "more" -> Html(nextPage.getOrElse("")))
        }.getOrElse(Ok(Compressed(views.html.matches(fixturesPage))))
      }
    }
  }

  def competitionDoesNotExist(competition: String): Boolean = {
    Competitions.withCompetitionFilter(competition).competitions.isEmpty
  }

  private def toNextPreviousUrl(date: DateMidnight, competition: String) = date match {
    case today if today == DateMidnight.now => "/football/%s/fixtures" format (competition)
    case other => "/football/%s/fixtures/%s" format (competition, other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
