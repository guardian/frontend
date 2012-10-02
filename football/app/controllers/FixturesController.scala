package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model._
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import model.Competition
import model.Page
import controllers.FixturesPage
import scala.Some
import controllers.FixturesOnDate
import views.html.fixtures

case class FixturesOnDate(date: DateMidnight, competitions: Seq[Competition])

case class FixturesPage(page: MetaData, days: Seq[FixturesOnDate], nextPage: String, previousPage: String)

object FixturesController extends Controller with Logging {
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")
  val page = Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "Football fixtures")

  def renderDate(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(date: Option[DateMidnight] = None) = Action { implicit request =>

    val dayOne = date.getOrElse(new DateMidnight)
    val dayTwo = dayOne.plusDays(1)
    val dayThree = dayTwo.plusDays(1)

    val fixtures = Seq(
      FixturesOnDate(dayOne, Competitions.withFixturesOrResultsOn(dayOne)),
      FixturesOnDate(dayTwo, Competitions.withFixturesOrResultsOn(dayTwo)),
      FixturesOnDate(dayThree, Competitions.withFixturesOrResultsOn(dayThree))
    )

    CachedOk(page) {
      Compressed(
        views.html.fixtures(
          FixturesPage(page, fixtures,
            nextPage = "/football/fixtures/%s".format(dayThree.plusDays(1).toString("yyyy/MMM/dd").toLowerCase),
            previousPage = "/football/fixtures/%s".format(dayOne.minusDays(3).toString("yyyy/MMM/dd").toLowerCase)
          ))
      )
    }
  }
}
