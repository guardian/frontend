package controllers

import common._
import play.api.mvc.{ Action, Controller }
import feed.Competitions
import model.{ CachedOk, Competition, MetaData, Page }
import org.joda.time.DateMidnight
import pa.Fixture
import org.joda.time.format.{ DateTimeFormat, DateTimeFormatter }

case class CompetitonFixtures(url: String, fullName: String, shortName: String, fixtures: Seq[Fixture])

object CompetitonFixtures {
  def apply(c: Competition, fixtures: Seq[Fixture]): CompetitonFixtures = CompetitonFixtures(c.url, c.fullName, c.shortName, fixtures)
}

case class FixturesOnDate(date: DateMidnight, competitions: Seq[CompetitonFixtures])

case class FixturesPage(page: MetaData, days: Seq[FixturesOnDate])

object FixturesController extends Controller with Logging {

  val page = Page("http://www.guardian.co.uk/football/matches", "football/fixtures", "football", "", "Football fixtures")

  def renderDate(year: String, month: String, day: String) = render(Some(year), Some(month), Some(day))

  def render(year: Option[String] = None, month: Option[String] = None, day: Option[String] = None) = Action { implicit request =>

    val dayOne = (year, month, day) match {
      case (Some(y), Some(m), Some(d)) => DateTimeFormat.forPattern("yyyyMMMdd").parseDateTime(y + m + d).toDateMidnight
      case _ => new DateMidnight
    }

    val dayTwo = dayOne.plusDays(1)
    val dayThree = dayTwo.plusDays(1)

    val fixtures = Seq(
      FixturesOnDate(dayOne, fixturesFor(dayOne)),
      FixturesOnDate(dayTwo, fixturesFor(dayTwo)),
      FixturesOnDate(dayThree, fixturesFor(dayThree))
    )

    CachedOk(page) {
      Compressed(views.html.fixtures(FixturesPage(page, fixtures.filter(_.competitions.nonEmpty))))
    }
  }

  private def fixturesFor(date: DateMidnight) = {
    val competitions = Competitions.competitions
    val allComps = competitions.map { comp => CompetitonFixtures(comp, comp.fixtures.filter(_.fixtureDate.toDateMidnight == date)) }
    allComps.filter(_.fixtures.nonEmpty)
  }
}
