package controllers.microapp

import model.{ Cached, TeamMap }
import feed.{ CompetitionSupport, Competitions }
import pa.FootballMatch
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateMidnight
import common.{ JsonComponent, Logging, Compressed }
import play.api.mvc._
import model.Competition
import implicits.{ Requests, Football }

trait LiveScoresComponentController extends Controller with Football with Requests with Logging {
  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderScores(year: String, month: String, day: String) = Action { implicit request =>
    getMatchAndCompetition(year, month, day) map {
      case (m, c) =>
        Cached(60) {
          Ok(Compressed(views.html.microapp.matchLiveScore(m, c)))
        }
    } getOrElse NotFound
  }

  def renderJson(year: String, month: String, day: String) = Action { implicit request =>
    getMatchAndCompetition(year, month, day) map {
      case (m, c) =>
        Cached(60) {
          JsonComponent(
            request.getParameter("callback"),
            "scores" -> views.html.microapp.matchLiveScore(m, c)
          )
        }
    } getOrElse NotFound
  }

  def getMatchAndCompetition(year: String, month: String, day: String)(implicit request: Request[_]): Option[(FootballMatch, Competition)] =
    request.getParameter("teams") flatMap { teamStr =>
      val allTeams = teamStr.split(",") filter { teamExists }
      println("*** Teams: " + allTeams.mkString(","))
      if (allTeams.size == 2) {
        val date = makeDate(year, month, day)
        date flatMap { getMatchAndCompetition(_, allTeams(0), allTeams(1)) }
      } else
        None
    }

  def getMatchAndCompetition(date: DateMidnight, team1: String, team2: String): Option[(FootballMatch, Competition)] = {
    val theMatch = competitions.matches find { m =>
      m.isOn(date) &&
        ((m.homeTeam.id == team1 && m.awayTeam.id == team2) || (m.homeTeam.id == team2 && m.awayTeam.id == team1))
    }
    println("*** Request Date: " + date)
    println("*** Match Date: " + (theMatch map { _.date.toString() } getOrElse ""))
    theMatch flatMap { m => competitions.withMatch(m.id) map { c => (m, c) } }
  }

  private def makeDate(year: String, month: String, day: String): Option[DateMidnight] = {
    try {
      Some(dateFormat.parseDateTime(year + month + day).toDateMidnight)
    } catch {
      case e: Throwable => None
    }
  }

  protected def teamExists(id: String): Boolean

  protected def competitions: CompetitionSupport
}

object LiveScoresComponentController extends LiveScoresComponentController {

  def teamExists(id: String): Boolean = TeamMap.findUrlNameFor(id).isDefined

  def competitions = Competitions
}