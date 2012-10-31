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

trait FixtureRenderer extends Controller with CompetitionFixtureFilters {

  val daysToDisplay = 3
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderFixtures(page: Page,
    competitions: CompetitionSupport,
    date: Option[DateMidnight] = None,
    competitionFilter: Option[String],
    competition: Option[String])(implicit request: RequestHeader) = {
    val startDate = date.getOrElse(new DateMidnight)

    val dates = competitions.nextMatchDates(startDate, daysToDisplay)

    val fixtures = dates.map { day => MatchesOnDate(day, competitions.withMatchesOn(day).competitions) }

    val nextPage = dates.lastOption.flatMap { date =>
      competitions.nextMatchDates(date.plusDays(1), daysToDisplay).headOption
    }.map(date => toNextPreviousUrl(date, competitionFilter))

    val previousPage = competitions.previousMatchDates(startDate.minusDays(1), daysToDisplay)
      .lastOption.map(date => toNextPreviousUrl(date, competitionFilter))

    val fixturesPage = MatchesPage(page, None, fixtures.filter(_.competitions.nonEmpty),
      nextPage, previousPage, "fixtures", filters, competition)

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(
          "html" -> views.html.fragments.matchesList(fixturesPage),
          "more" -> Html(nextPage.getOrElse("")))
      }.getOrElse(Ok(Compressed(views.html.matches(fixturesPage))))
    }
  }

  def toNextPreviousUrl(date: DateMidnight, competitionFilter: Option[String]): String
}

object FixturesController extends FixtureRenderer with Logging {

  val page = new Page(
    "http://www.guardian.co.uk/football/matches",
    "football/fixtures",
    "football",
    "",
    "All fixtures",
    "GFE:Football:automatic:fixtures"
  )

  def renderFor(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(date: Option[DateMidnight] = None) = Action { implicit request =>
    renderFixtures(page, Competitions.withTodaysMatchesAndFutureFixtures, date, None, None)
  }

  override def toNextPreviousUrl(date: DateMidnight, competitionFilter: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/fixtures"
    case other => "/football/fixtures/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object CompetitionFixturesController extends FixtureRenderer with Logging {

  override val daysToDisplay = 20

  def renderFor(year: String, month: String, day: String, competition: String) = render(
    competition, Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competitionName: String, date: Option[DateMidnight] = None) = Action { implicit request =>
    Competitions.competitions.find(_.url.endsWith(competitionName)).map { competition =>

      val page = new Page(
        "http://www.guardian.co.uk/football/matches",
        "football/fixtures",
        "football",
        "",
        competition.fullName + " fixtures",
        "GFE:Football:automatic:competition fixtures"
      )
      renderFixtures(
        page,
        Competitions.withTodaysMatchesAndFutureFixtures.withCompetitionFilter(competitionName),
        date,
        Some(competitionName),
        Some(competition.url)
      )

    }.getOrElse(NotFound)
  }

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/%s/fixtures" format (competition.getOrElse(""))
    case other => "/football/%s/fixtures/%s" format (competition.getOrElse(""), other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
