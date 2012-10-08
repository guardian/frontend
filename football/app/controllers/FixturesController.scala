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

object FixturesController extends Controller with Logging {
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "All fixtures")

  def allCompetitionsOn(year: String, month: String, day: String) = allCompetitions(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def allCompetitions(date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val fixtureDays = Competitions.nextThreeFixtureDatesStarting(startDate)

    // get the competition param from the query string
    val competitionFilter = request.queryString.get("competition").map(_.head)

    val fixtures = fixtureDays.map {
      day =>
        MatchesOnDate(day, Competitions.withFixturesOrResultsOn(day).filter {
          // if supplied competition filter, filter out other competitions
          c => c.shortName == competitionFilter.getOrElse(c.shortName)
        })
    }

    val nextPage = findNextDateWithFixtures(fixtureDays)
    val previousPage = findPreviousDateWithFixtures(startDate)

    val fixturesPage = MatchesPage(page, fixtures.filter(_.competitions.nonEmpty), nextPage, previousPage, "fixtures", competitionFilter)

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(
          "html" -> views.html.fragments.matchesList(fixturesPage),
          "more" -> Html(nextPage.getOrElse("")))
      }.getOrElse(Ok(views.html.matches(fixturesPage)))
    }
  }

  def findPreviousDateWithFixtures(date: DateMidnight) =
    Competitions.threeFixtureDatesBefore(date).lastOption.map(toNextPreviousUrl)

  private def findNextDateWithFixtures(fixtureDays: Seq[DateMidnight]) = fixtureDays.lastOption.flatMap { date =>
    Competitions.nextThreeFixtureDatesStarting(date.plusDays(1)).headOption.map(toNextPreviousUrl)
  }

  private def toNextPreviousUrl(date: DateMidnight) = date match {
    case today if today == DateMidnight.now => "/football/fixtures"
    case other => "/football/fixtures/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}
