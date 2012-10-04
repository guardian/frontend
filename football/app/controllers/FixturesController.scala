package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import play.api.Play.current
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import model.Competition
import model.Page
import scala.Some
import play.api.templates.Html
import play.api.libs.concurrent.Akka

case class FixturesOnDate(date: DateMidnight, competitions: Seq[Competition])

case class FixturesPage(page: MetaData, days: Seq[FixturesOnDate], nextPage: Option[String], previousPage: Option[String])

object FixturesController extends Controller with Logging {
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "Football fixtures")

  def warmup() = Action {
    val promiseOfWarmup = Akka.future(Competitions.warmup())
    Async {
      promiseOfWarmup.map(w => Ok("warm"))
    }
  }

  def renderDate(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(date: Option[DateMidnight] = None) = Action { implicit request =>

    val startDate = date.getOrElse(new DateMidnight)

    val fixtureDays = Competitions.nextThreeFixtureDatesStarting(startDate)

    val fixtures = fixtureDays.map { day =>
      FixturesOnDate(day, Competitions.withFixturesOrResultsOn(day))
    }

    val nextPage = findNextDateWithFixtures(fixtureDays)
    val previousPage = findPreviousDateWithFixtures(startDate)

    Cached(page) {
      val fixturesPage = FixturesPage(page, fixtures.filter(_.competitions.nonEmpty), nextPage, previousPage)
      request.getQueryString("callback").map { callback =>

        JsonComponent(
          "html" -> views.html.fixtures(fixturesPage, json = true),
          "more" -> Html(nextPage.getOrElse(""))
        )

      }.getOrElse(Ok(views.html.fixtures(fixturesPage, json = false)))
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
