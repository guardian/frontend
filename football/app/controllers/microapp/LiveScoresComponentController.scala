package controllers.microapp

import model.{ Cached, TeamMap }
import feed.{ CompetitionSupport, Competitions }
import common.{ JsonComponent, Logging, Compressed }
import play.api.mvc._
import model.Competition
import implicits.{ Requests, Football }
import controllers.{ MoreOnMatchController, MatchNav }
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateMidnight
import concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._

trait LiveScoresComponentController extends Controller with Football with Requests with Logging {
  type Renderer = (MatchNav, Competition, RequestHeader) => Result

  def renderScores() = renderMatchNav { (nav, comp, request) =>
    Ok(Compressed(views.html.microapp.matchLiveScore(nav, comp)))
  }

  def renderJson() = renderMatchNav { (nav, comp, request) =>
    JsonComponent(
      request.getParameter("callback"),
      "scores" -> views.html.microapp.matchLiveScore(nav, comp)
    )
  }

  protected def renderMatchNav(renderer: Renderer) = Action { implicit request =>
    val teamsAndPath = request.getParameter("teams") map { _.split(",") filter { teamExists } } match {
      case Some(Array(team1, team2)) =>
        request.getParameter("currentPage") map { (team1, team2, _) }

      case _ => None
    }

    teamsAndPath map {
      case (team1, team2, path) =>
        val date = extractDate(path)
        val future = futureMatchNav(date, team1, team2)
        Async {
          future map { optNav: Option[MatchNav] =>
            optNav map { nav =>
              val comp = competitions.withMatch(nav.theMatch.id).get
              Cached(60) {
                renderer(nav, comp, request)
              }
            } getOrElse NotFound
          }
        }
    } getOrElse NotFound
  }

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMMdd")

  protected def extractDate(path: String): DateMidnight = {
    path.split("/").toList match {
      case "football" :: year :: month :: day :: _ =>
        dateFormat.parseDateTime(year + month + day).toDateMidnight

      case _ => throw new IllegalArgumentException("Invalid path for currentPage")
    }
  }

  protected def teamExists(id: String): Boolean

  protected def competitions: CompetitionSupport

  protected def futureMatchNav(date: DateMidnight, team1: String, team2: String)(implicit request: RequestHeader): Future[Option[MatchNav]]
}

object LiveScoresComponentController extends LiveScoresComponentController {

  protected def teamExists(id: String): Boolean = TeamMap.findUrlNameFor(id).isDefined

  protected def competitions = Competitions

  protected def futureMatchNav(date: DateMidnight, team1: String, team2: String)(implicit request: RequestHeader): Future[Option[MatchNav]] = {
    MoreOnMatchController.futureMatchNav(date, team1, team2)
  }
}