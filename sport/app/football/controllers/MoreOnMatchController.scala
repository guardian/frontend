package football.controllers

import feed.Competitions
import model.{ Trail, Cached, Content }
import play.api.mvc.{ SimpleResult, RequestHeader, Action, Controller }
import common._
import org.joda.time.format.DateTimeFormat
import conf.ContentApi
import org.scala_tools.time.Imports._
import pa.FootballMatch
import implicits.{ Requests, Football }

import concurrent.Future

case class Report(trail: Trail, name: String)

case class MatchNav(theMatch: FootballMatch, matchReport: Option[Trail],
    minByMin: Option[Trail], stats: Trail, currentPage: Option[Trail]) {

  // do not count stats as a report (stats will always be there)
  lazy val hasReports = hasReport || hasMinByMin
  lazy val hasMinByMin = minByMin.isDefined
  lazy val hasReport = matchReport.isDefined
}

object MoreOnMatchController extends Controller with Football with Requests with Logging with ExecutionContexts {

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMdd")

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchNavJson(year: String, month: String, day: String, team1: String, team2: String) = matchNav(year, month, day, team1, team2)
  def matchNav(year: String, month: String, day: String, team1: String, team2: String) = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val interval = new Interval(contentDate - 2.days, contentDate + 3.days)

    val maybeResponse: Option[Future[SimpleResult]] = Competitions().matchFor(interval, team1, team2) map { theMatch =>
      val related: Future[Seq[Content]] = loadMoreOn(request, theMatch)
      // We are only interested in content with exactly 2 team tags
      related map { _ filter hasExactlyTwoTeams } map {
        case Nil => JsonNotFound()
        case filtered => JsonComponent(
          "nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, filtered))
        )
      }
    }

    val response = maybeResponse.getOrElse(Future { JsonNotFound() })
    response map { Cached(300) }
  }

  def moreOnJson(matchId: String) = moreOn(matchId)
  def moreOn(matchId: String) = Action.async { implicit request =>
    val maybeMatch: Option[FootballMatch] = Competitions().findMatch(matchId)

    val maybeResponse: Option[Future[SimpleResult]] = maybeMatch map { theMatch =>
      loadMoreOn(request, theMatch) map {
        case Nil => JsonNotFound()
        case related => JsonComponent(
          ("nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, related filter { hasExactlyTwoTeams }))),
          ("related" -> views.html.fragments.relatedTrails(related, "More on this match", 5))
        )
      }
    }

    val response: Future[SimpleResult] = maybeResponse.getOrElse(Future { JsonNotFound() })
    response map { Cached(300) }
  }

  def loadMoreOn(request: RequestHeader, theMatch: FootballMatch): Future[Seq[Content]] = {
    val matchDate = theMatch.date.toDateMidnight
    ContentApi.search(Edition(request))
      .section("football")
      .tag("tone/matchreports|football/series/squad-sheets|football/series/saturday-clockwatch")
      .fromDate(matchDate.minusDays(2))
      .toDate(matchDate.plusDays(2))
      .reference(s"pa-football-team/${theMatch.homeTeam.id},pa-football-team/${theMatch.awayTeam.id}")
      .response.map{ response =>
        response.results.map(Content(_))
    }
  }

  //for our purposes we expect exactly 2 football teams
  private def hasExactlyTwoTeams(content: Content) = content.tags.filter(_.isFootballTeam).size == 2

  private def populateNavModel(theMatch: FootballMatch, related: Seq[Content])(implicit request: RequestHeader) = {
    val matchDate = theMatch.date.toDateMidnight
    val matchReport = related.find { c => c.webPublicationDate >= matchDate && c.matchReport && !c.minByMin }
    val minByMin = related.find { c => c.webPublicationDate.toDateMidnight == matchDate && c.matchReport && c.minByMin }
    val stats: Trail = theMatch

    val currentPage = request.getParameter("page").flatMap { pageId =>
      (stats :: List(matchReport, minByMin).flatten).find(_.url.endsWith(pageId))
    }

    MatchNav(theMatch, matchReport, minByMin, stats, currentPage)
  }
}