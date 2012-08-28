package controllers

import common._
import model.{ MetaData, Page, Football }
import play.api.mvc.{ Content => _, _ }
import org.joda.time.format.DateTimeFormat
import conf.FootballClient
import play.api.libs.concurrent.{ Promise, Akka }
import play.api.Play.current
import pa.{ MatchDay, Season }
import org.joda.time.DateMidnight

case class Competition(season: Season, matches: Seq[MatchDay])

case class MatchesOnADay(page: MetaData, date: DateMidnight, competitions: Seq[Competition]) {
  val previousDay: DateMidnight = date.minusDays(1)
  val nextDay: Option[DateMidnight] = if (DateMidnight.now.isAfter(date)) Some(date.plusDays(1)) else None
  val hasMatches = competitions.nonEmpty
}

object MatchesOnADayController extends Controller with Logging {

  val dateFormat = DateTimeFormat.forPattern("yyyy/MMM/dd")

  def render(year: String, month: String, day: String) = Action {
    implicit request =>

      val id = "football/%s/%s/%s/matches".format(year, month, day)

      val page = Page(
        "http://www.guardian.co.uk/" + id,
        id,
        "football",
        "",
        "Football matches"
      )

      val date = dateFormat.parseDateTime(Seq(year, month, day).mkString("/")).toDateMidnight

      val competitions = Football.competitionsOpenOn(date)

      val competitionPromises = competitions.map { c =>
        Akka.future {
          val matches = FootballClient.matchDay(c.id, date)
          Competition(c, matches.sortBy(_.date.getMillisOfDay))
        }
      }

      Async {
        Promise.sequence(competitionPromises).map { comps =>
          Ok(Compressed(views.html.matchesOnADay(MatchesOnADay(page, date, comps.filter(_.matches.nonEmpty)))))
        }
      }
  }
}
