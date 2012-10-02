package controllers

import common._
import feed.Competitions
import play.api.mvc.{ Action, Controller }
import model.{ CachedOk, Competition, MetaData, Page }
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat

case class FixturesOnDate(date: DateMidnight, competitions: Seq[Competition])

case class FixturesPage(page: MetaData, days: Seq[FixturesOnDate])

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
      FixturesOnDate(dayOne, Competitions.withFixturesOn(dayOne)),
      FixturesOnDate(dayTwo, Competitions.withFixturesOn(dayTwo)),
      FixturesOnDate(dayThree, Competitions.withFixturesOn(dayThree))
    )

    CachedOk(page) {
      Compressed(views.html.fixtures(FixturesPage(page, fixtures.filter(_.competitions.nonEmpty))))
    }
  }
}
