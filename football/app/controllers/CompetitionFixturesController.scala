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

object CompetitionFixturesController extends Controller with Logging {

  val daysToShow = 20
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = new Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "All fixtures")

  def renderFor(year: String, month: String, day: String, competition: String) = render(
    competition, Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competition: String, date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val fixtureDays = Competitions.nextFixtureDatesStarting(startDate, daysToShow, competitionUrl = Some(competition))

    val fixtures = fixtureDays.map { day => MatchesOnDate(day, Competitions.withMatchesOn(day).filter(_.url == "/football/" + competition)) }

    val nextPage = findNextDateWithFixtures(fixtureDays, competition)
    val previousPage = findPreviousDateWithFixtures(startDate, competition)

    val filters = Competitions.competitionsThatHaveFixtures.groupBy(_.nation)
      .map {
        case (nation, competitions) =>
          nation -> competitions.map(c => CompetitionFilter(c.fullName, c.url + "/fixtures"))
      }

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

  def findPreviousDateWithFixtures(date: DateMidnight, competition: String) =
    Competitions.lastFixtureDatesBefore(date, daysToShow).lastOption.map(toNextPreviousUrl(_, competition))

  private def findNextDateWithFixtures(fixtureDays: Seq[DateMidnight], competition: String) = fixtureDays.lastOption.flatMap { date =>
    Competitions.nextFixtureDatesStarting(date.plusDays(1), daysToShow).headOption.map(toNextPreviousUrl(_, competition))
  }

  private def toNextPreviousUrl(date: DateMidnight, competition: String) = date match {
    case today if today == DateMidnight.now => "/football/%s/fixtures" format (competition)
    case other => "/football/%s/fixtures/%s" format (competition, other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
