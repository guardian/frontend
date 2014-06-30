package football.controllers

import common._
import conf.LiveContentApi
import feed.Competitions
import implicits.{Football, Requests}
import model.{Cached, Content, Trail}
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import org.scala_tools.time.Imports._
import pa.FootballMatch
import play.api.mvc.{Action, Controller, RequestHeader, SimpleResult}
import play.api.templates.Html

import scala.concurrent.Future

case class Report(trail: Trail, name: String)

case class MatchNav(theMatch: FootballMatch, matchReport: Option[Trail],
    minByMin: Option[Trail], preview: Option[Trail], stats: Trail, currentPage: Option[Trail]) {

  // do not count stats as a report (stats will always be there)
  lazy val hasReports = hasReport || hasMinByMin || hasPreview
  lazy val hasMinByMin = minByMin.isDefined
  lazy val hasReport = matchReport.isDefined
  lazy val hasPreview = preview.isDefined
}

object MoreOnMatchController extends Controller with Football with Requests with Logging with ExecutionContexts {
  def interval(contentDate: DateMidnight) = new Interval(contentDate - 2.days, contentDate + 3.days)

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMdd").withZone(DateTimeZone.forID("Europe/London"))

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchNavJson(year: String, month: String, day: String, team1: String, team2: String) = matchNav(year, month, day, team1, team2)
  def matchNav(year: String, month: String, day: String, team1: String, team2: String) = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toDateMidnight

    val maybeResponse: Option[Future[SimpleResult]] = Competitions().matchFor(interval(contentDate), team1, team2) map { theMatch =>
      val related: Future[Seq[Content]] = loadMoreOn(request, theMatch)
      // We are only interested in content with exactly 2 team tags

      val group = theMatch.round.name.flatMap {
        case roundName if roundName.toLowerCase.startsWith("group") => Some(roundName.toLowerCase.replace(' ', '-'))
        case _ => None
      }.getOrElse("")

      related map { _ filter hasExactlyTwoTeams } map { filtered =>
        Cached(if(theMatch.isLive) 10 else 300) {
          JsonComponent(
            "nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, filtered)),
            "matchSummary" -> football.views.html.fragments.matchSummary(theMatch, Competitions().competitionForMatch(theMatch.id), responsive = true),
            "hasStarted" -> theMatch.hasStarted,
            "group" -> group,
            "matchDate" ->  DateTimeFormat.forPattern("yyyy/MMM/dd").print(theMatch.date).toLowerCase(),
            "dropdown" -> views.html.fragments.dropdown("")(Html(""))
          )
        }
      }
    }

    maybeResponse.getOrElse(Future.successful(Cached(30){ JsonNotFound() }))
  }

  def moreOnJson(matchId: String) = moreOn(matchId)
  def moreOn(matchId: String) = Action.async { implicit request =>
    val maybeMatch: Option[FootballMatch] = Competitions().findMatch(matchId)

    val maybeResponse: Option[Future[SimpleResult]] = maybeMatch map { theMatch =>
      loadMoreOn(request, theMatch) map {
        case Nil => JsonNotFound()
        case related => JsonComponent(
          "nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, related filter {
            hasExactlyTwoTeams
          })),
          "related" -> views.html.fragments.relatedTrails(related, "More on this match", 5)
        )
      }
    }

    val response: Future[SimpleResult] = maybeResponse.getOrElse(Future { JsonNotFound() })
    response map { Cached(60) }
  }

  def loadMoreOn(request: RequestHeader, theMatch: FootballMatch): Future[Seq[Content]] = {
    val matchDate = theMatch.date.toDateMidnight

    LiveContentApi.search(Edition(request))
      .section("football")
      .tag("tone/matchreports|football/series/squad-sheets|football/series/match-previews|football/series/saturday-clockwatch")
      .fromDate(matchDate.minusDays(2))
      .toDate(matchDate.plusDays(2))
      .reference(s"pa-football-team/${theMatch.homeTeam.id},pa-football-team/${theMatch.awayTeam.id}")
      .response.map{ response =>
        response.results.map(Content(_))
    }
  }

  def redirectToMatchId(matchId: String) = Action.async { implicit request =>
    val maybeMatch: Option[FootballMatch] = Competitions().findMatch(matchId)
    canonicalRedirectForMatch(maybeMatch, request)
  }

  def redirectToMatch(year: String, month: String, day: String, home: String, away: String) = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val maybeMatch = Competitions().matchFor(interval(contentDate), home, away)
    canonicalRedirectForMatch(maybeMatch, request)
  }

  def bigMatchSpecial(matchId: String) = Action { implicit request =>
    val response = Competitions().competitions.find { _.matches.exists(_.id == matchId) }
      .fold(JsonNotFound()) { competition =>
        val fMatch = competition.matches.find(_.id == matchId).head
        JsonComponent("html" -> football.views.html.fragments.matchSummary(fMatch, Some(competition), link = true))
      }
    Cached(30)(response)
  }

  private def canonicalRedirectForMatch(maybeMatch: Option[FootballMatch], request: RequestHeader): Future[SimpleResult] = {
    maybeMatch.map { theMatch =>
      loadMoreOn(request, theMatch).map { related =>
        val (matchReport, minByMin, preview, stats) = fetchRelatedMatchContent(theMatch, related)
        val canonicalPage = matchReport.orElse(minByMin).orElse { if (theMatch.isFixture) preview else None }.getOrElse(stats)
        Cached(60)(TemporaryRedirect(canonicalPage.url))
      }
    }.getOrElse {
      // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
      Future.successful(Cached(60)(TemporaryRedirect("/football/results")))
    }
  }

  //for our purposes we expect exactly 2 football teams
  private def hasExactlyTwoTeams(content: Content) = content.tags.count(_.isFootballTeam) == 2

  private def fetchRelatedMatchContent(theMatch: FootballMatch, related: Seq[Content]): (Option[Trail], Option[Trail], Option[Trail], Trail) = {
    val matchDate = theMatch.date.toDateMidnight
    val matchReport = related.find { c => c.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")) >= matchDate && c.matchReport && !c.minByMin && !c.preview }
    val minByMin = related.find { c => c.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")).toDateMidnight == matchDate && c.matchReport && c.minByMin && !c.preview }
    val preview = related.find { c => c.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")) <= matchDate && (c.preview || c.squadSheet) && !c.matchReport && !c.minByMin }
    val stats: Trail = theMatch
    (matchReport, minByMin, preview, stats)
  }

  private def populateNavModel(theMatch: FootballMatch, related: Seq[Content])(implicit request: RequestHeader) = {
    val (matchReport, minByMin, preview, stats) = fetchRelatedMatchContent(theMatch, related)

    val currentPage = request.getParameter("page").flatMap { pageId =>
      (stats :: List(matchReport, minByMin, preview).flatten).find(_.url.endsWith(pageId))
    }

    MatchNav(theMatch, matchReport, minByMin, preview, stats, currentPage)
  }
}
