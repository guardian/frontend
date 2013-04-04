package controllers.microapp

import model.{ Cached, TeamMap }
import feed.{ CompetitionSupport, Competitions }
import common._
import play.api.mvc._
import model.Competition
import implicits.{ Requests, Football }
import controllers.{ MoreOnMatchController, MatchNav }
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateMidnight
import concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._
import scala.Some
import controllers.MatchNav
import model.Competition

trait LiveScoresComponentController extends Controller with Football with Requests with Logging {
  type Renderer = (MatchNav, Competition, RequestHeader) => Result

  def renderScores() = {
    renderMatchNav(None) { (nav, comp, request) =>
      val ajaxUrl = Site(request).ajaxHost + "/football/api/microapp/scores/" + nav.theMatch.id
      Ok(Compressed(views.html.microapp.matchLiveScore(nav, comp, ajaxUrl)))
    }
  }

  def renderJson(matchId: String) = Action { implicit request =>
    competitions.withMatch(matchId) flatMap { comp =>
      comp.matches find {_.id == matchId} map { theMatch =>
        Cached(60) {
          JsonComponent(
            request.getParameter("callback"),
            "scores" -> views.html.microapp.scoreLine(theMatch, comp)
          )
        }
      }
    } getOrElse NotFound
  }

  protected def renderMatchNav(date: Option[DateMidnight])(renderer: Renderer) = Action { implicit request =>
    val theDate = date getOrElse {
      request.getParameter("currentPage") match {
        case Some(path) => extractDate(path)
        case _ => throw new IllegalArgumentException("No currentPath found!")
      }
    }
    val teams = request.getParameter("teams") map { _.split(",") filter { teamExists } } match {
      case Some(Array(team1, team2)) => Some(team1, team2)

      case _ => None
    }

    teams map {
      case (team1, team2) =>
        val future = futureMatchNav(theDate, team1, team2)
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