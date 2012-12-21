package controllers

import model.{ Trail, Cached, Content }
import play.api.mvc.{ RequestHeader, Action, Controller }
import common.{ JsonComponent, Edition, Logging }
import org.joda.time.format.DateTimeFormat
import conf.{ Configuration, ContentApi }
import org.joda.time.DateMidnight
import play.api.libs.concurrent.Akka
import play.api.Play.current
import feed.Competitions
import org.scala_tools.time.Imports._
import pa.FootballMatch

case class ScoresComponent(theMatch: FootballMatch, matchReport: Option[Trail],
    minByMin: Option[Trail], squadSheet: Option[Trail]) {

  lazy val hasReports = matchReport.orElse(minByMin).orElse(squadSheet).isDefined

}

object MoreOnMatchController extends Controller with Logging {

  val dateFormat = DateTimeFormat.forPattern("yyyyMMdd")

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def scores(year: String, month: String, day: String, team1: String, team2: String) = Action { implicit request =>

    val matchDate = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val interval = new Interval(matchDate - 2.days, matchDate + 3.days)

    Competitions.matchFor(interval, team1, team2).map { theMatch =>
      val promiseOfRelated = Akka.future(loadMoreOn(request, matchDate, team1, team2))
      Async {
        promiseOfRelated.map { related =>

          val matchReport = related.find { c =>
            c.webPublicationDate >= matchDate &&
              c.tags.exists(_.id == "tone/matchreports") &&
              !c.tags.exists(_.id == "tone/minutebyminute") &&
              c.tags.filter(_.isFootballTeam).length == 2
          }

          val minByMin = related.find { c =>
            c.webPublicationDate.toDateMidnight == matchDate &&
              c.tags.exists(_.id == "tone/matchreports") &&
              c.tags.exists(_.id == "tone/minutebyminute") &&
              c.tags.filter(_.isFootballTeam).length == 2
          }

          val squadSheet = related.find { c =>
            c.webPublicationDate <= matchDate &&
              c.tags.exists(_.id == "football/series/squad-sheets") &&
              c.tags.filter(_.isFootballTeam).length == 2
          }

          Cached(60)(
            JsonComponent(
              views.html.fragments.scoresComponent(ScoresComponent(theMatch, matchReport, minByMin, squadSheet))
            )
          )
        }
      }
    }.getOrElse(NotFound)
  }

  def moreOn(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = Action { implicit request =>

    val matchDate = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val promiseOfRelated = Akka.future(loadMoreOn(request, matchDate, homeTeamId, awayTeamId))

    Async {
      promiseOfRelated.map {
        case Nil => NotFound
        case related => Cached(600)(JsonComponent(views.html.fragments.relatedTrails(related, "More on this match", 5)))
      }
    }
  }

  def loadMoreOn(request: RequestHeader, matchDate: DateMidnight, homeTeamId: String, awayTeamId: String): Seq[Content] = {
    ContentApi.search(Edition(request, Configuration))
      .section("football")
      .tag("tone/matchreports|football/series/squad-sheets|football/series/saturday-clockwatch")
      .fromDate(matchDate.minusDays(2))
      .toDate(matchDate.plusDays(2))
      .reference("pa-football-team/" + homeTeamId + ",pa-football-team/" + awayTeamId)
      .response.results.map {
        new Content(_)
      }
  }
}
