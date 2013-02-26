package controllers.microapp

import model.{ Cached, TeamMap }
import feed.{ CompetitionSupport, Competitions }
import pa.FootballMatch
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateMidnight
import common.{ Logging, Compressed }
import play.api.mvc._
import model.Competition
import scala.Some
import implicits.{ Requests, Football }

trait LiveScoresComponentController extends Controller with Football with Requests with Logging {
  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderScores(year: String, month: String, day: String) = Action { implicit request =>
    //    val teams: Option[(String, String)] = request.getParameter("teams") flatMap { teamStr =>
    //      val allTeams = teamStr.split(",") filter teamExists
    //      if (allTeams.size == 2) Some((allTeams(0), allTeams(1))) else None
    //    }
    //
    //    val matchAndComp: Option[(FootballMatch, Competition)] = teams match {
    //      case Some((team1, team2)) =>
    //        val date: DateMidnight = dateFormat.parseDateTime("2013feb25").toDateMidnight
    //        log.error("Live scores date: " + date + ", teams: " + team1 + ", " + team2)
    //        competitions.withMatchesOn(date).competitions.collectFirst {
    //          case c =>
    //            c.matches find { m =>
    //              (m.homeTeam == team1 && m.awayTeam == team2) ||
    //                (m.homeTeam == team2 && m.awayTeam == team1)
    //            } match {
    //              case Some(theMatch) => (theMatch, c)
    //            }
    //        }
    //
    //      case _ =>
    //        log.error("No teams found!")
    //        None
    //    }

    val date: DateMidnight = dateFormat.parseDateTime("2013feb25").toDateMidnight
    println("*** Date: " + date)
    val comp = Competitions.withMatchesOn(date).competitions.headOption
    val matchAndComp = comp map { c => (c.matches.find(_.isOn(date)).get, c) }
    val matchDate = (matchAndComp map { _._1.date }).get
    println("*** Match date: " + matchDate)
    render(matchAndComp)
  }

  private def render(matchAndComp: Option[(FootballMatch, Competition)]): Result = {
    matchAndComp map {
      case (m, c) =>
        Cached(60) {
          Ok(Compressed(views.html.microapp.matchLiveScore(m, c)))
        }
    } getOrElse NotFound
  }

  protected def teamExists(id: String): Boolean

  protected def competitions: CompetitionSupport
}

object LiveScoresComponentController extends LiveScoresComponentController {

  def teamExists(id: String): Boolean = TeamMap.shortNames contains id

  def competitions = Competitions
}