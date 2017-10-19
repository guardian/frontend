package football.controllers

import common._
import conf.Configuration
import contentapi.ContentApiClient
import feed.CompetitionsService
import football.model.FootballMatchTrail
import implicits.{Football, Requests}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{Cached, Content, ContentType}
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat
import org.scala_tools.time.Imports
import org.scala_tools.time.Imports._
import pa.FootballMatch
import play.api.libs.json._
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

case class Report(trail: FootballMatchTrail, name: String)

case class MatchNav(
  theMatch: FootballMatch,
  matchReport: Option[FootballMatchTrail],
  minByMin: Option[FootballMatchTrail],
  preview: Option[FootballMatchTrail],
  stats: FootballMatchTrail,
  currentPage: Option[FootballMatchTrail]) {

  // do not count stats as a report (stats will always be there)
  lazy val hasReports = hasReport || hasMinByMin || hasPreview
  lazy val hasMinByMin = minByMin.isDefined
  lazy val hasReport = matchReport.isDefined
  lazy val hasPreview = preview.isDefined
}

class MoreOnMatchController(
  val competitionsService: CompetitionsService,
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents)
  extends BaseController with Football with Requests with Logging with ImplicitControllerExecutionContext with implicits.Dates {
  def interval(contentDate: LocalDate): Imports.Interval = new Interval(contentDate.toDateTimeAtStartOfDay - 2.days, contentDate.toDateTimeAtStartOfDay + 3.days)

  private val dateFormat = DateTimeFormat.forPattern("yyyyMMdd").withZone(DateTimeZone.forID("Europe/London"))

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchNavJson(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] = matchNav(year, month, day, team1, team2)
  def matchNav(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toLocalDate

    val maybeResponse: Option[Future[Result]] = competitionsService.matchFor(interval(contentDate), team1, team2) map { theMatch =>
      val related: Future[Seq[ContentType]] = loadMoreOn(request, theMatch)
      // We are only interested in content with exactly 2 team tags

      val group = theMatch.round.name.flatMap {
        case roundName if roundName.toLowerCase.startsWith("group") => Some(roundName.toLowerCase.replace(' ', '-'))
        case _ => None
      }.getOrElse("")

      related map { _ filter hasExactlyTwoTeams } map { filtered =>
        Cached(if(theMatch.isLive) 10 else 300) {
          JsonComponent(
            "nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, filtered)),
            "matchSummary" -> football.views.html.fragments.matchSummary(theMatch, competitionsService.competitionForMatch(theMatch.id), responsive = true),
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

  def moreOnJson(matchId: String): Action[AnyContent] = moreOn(matchId)
  def moreOn(matchId: String): Action[AnyContent] = Action.async { implicit request =>
    val maybeMatch: Option[FootballMatch] = competitionsService.findMatch(matchId)

    val maybeResponse: Option[Future[RevalidatableResult]] = maybeMatch map { theMatch =>
      loadMoreOn(request, theMatch) map {
        case Nil =>
          log.info(s"Cannot load more for match id: ${theMatch.id}")
          JsonNotFound()
        case related => JsonComponent(
          "nav" -> football.views.html.fragments.matchNav(populateNavModel(theMatch, related filter {
            hasExactlyTwoTeams
          }))
        )
      }
    }

    val response: Future[RevalidatableResult] = maybeResponse.getOrElse(Future { JsonNotFound() })
    response map { Cached(60) }
  }

  def loadMoreOn(request: RequestHeader, theMatch: FootballMatch): Future[List[ContentType]] = {
    val matchDate = theMatch.date.toLocalDate
    val startOfDateRange = matchDate.minusDays(2).toDateTimeAtStartOfDay
    val endOfDateRange = matchDate.plusDays(2).toDateTimeAtStartOfDay

    contentApiClient.getResponse(contentApiClient.search(Edition(request))
      .section("football")
      .tag("tone/minutebyminute|tone/matchreports|football/series/squad-sheets|football/series/match-previews|football/series/saturday-clockwatch")
      .fromDate(jodaToJavaInstant(startOfDateRange))
      .toDate(jodaToJavaInstant(endOfDateRange))
      .reference(s"pa-football-team/${theMatch.homeTeam.id},pa-football-team/${theMatch.awayTeam.id}")
    ).map{ response =>
        response.results.map(Content(_)).toList
    }
  }

  def redirectToMatchId(matchId: String): Action[AnyContent] = Action.async { implicit request =>
    val maybeMatch: Option[FootballMatch] = competitionsService.findMatch(matchId)
    canonicalRedirectForMatch(maybeMatch, request)
  }

  def redirectToMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toLocalDate
    val maybeMatch = competitionsService.matchFor(interval(contentDate), home, away)
    canonicalRedirectForMatch(maybeMatch, request)
  }

  def bigMatchSpecial(matchId: String): Action[AnyContent] = Action { implicit request =>
    val response = competitionsService.competitions.find { _.matches.exists(_.id == matchId) }
      .fold(JsonNotFound()) { competition =>
        val fMatch = competition.matches.find(_.id == matchId).head
        JsonComponent(football.views.html.fragments.matchSummary(fMatch, Some(competition), link = true))
      }
    Cached(30)(response)
  }

  def matchSummaryMf2(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] = Action.async { implicit request =>
    val contentDate = dateFormat.parseDateTime(year + month + day).toLocalDate

    val maybeResponse: Option[Future[Result]] = competitionsService.matchFor(interval(contentDate), team1, team2) map { theMatch =>

      val related: Future[Seq[ContentType]] = loadMoreOn(request, theMatch)
      // We are only interested in content with exactly 2 team tags
      related map { _ filter hasExactlyTwoTeams } map { filtered =>
        Cached(if(theMatch.isLive) 10 else 300) {
          lazy val competition = competitionsService.competitionForMatch(theMatch.id)
          lazy val homeTeamResults = competition.map(_.teamResults(theMatch.homeTeam.id).take(5))

          implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
          JsonComponent(
            "items" -> Json.arr(
              Json.obj(
                "id" -> theMatch.id,
                "date" -> theMatch.date,
                "venue" -> theMatch.venue.map(_.name),
                "isLive" -> theMatch.isLive,
                "isResult" -> theMatch.isResult,
                "isLiveOrIsResult" -> (theMatch.isResult || theMatch.isLive),
                "homeTeam" -> Json.obj(
                  "name" -> theMatch.homeTeam.name,
                  "id" -> theMatch.homeTeam.id,
                  "score" -> theMatch.homeTeam.score,
                  "crest" -> s"${Configuration.staticSport.path}/football/crests/120/${theMatch.homeTeam.id}.png",
                  "scorers" -> theMatch.homeTeam.scorers.getOrElse("").split(",").map(scorer => {
                    Json.obj(
                      "scorer" -> scorer.replace("(", "").replace(")", "")
                    )
                  })
                ),
                "awayTeam" -> Json.obj(
                  "name" -> theMatch.awayTeam.name,
                  "id" -> theMatch.awayTeam.id,
                  "score" -> theMatch.awayTeam.score,
                  "crest" -> s"${Configuration.staticSport.path}/football/crests/120/${theMatch.awayTeam.id}.png",
                  "scorers" -> theMatch.awayTeam.scorers.getOrElse("").split(",").map(scorer => {
                    Json.obj(
                      "scorer" -> scorer.replace("(", "").replace(")", "")
                    )
                  })
                ),
                "competition" -> Json.obj(
                  "fullName" -> competition.map(_.fullName)
                )
              )
            )
          )
        }
      }
    }

    maybeResponse.getOrElse(Future.successful(Cached(30){ JsonNotFound() }))
  }

  private def canonicalRedirectForMatch(maybeMatch: Option[FootballMatch], request: RequestHeader)(implicit requestHeader: RequestHeader): Future[Result] = {
    maybeMatch.map { theMatch =>
      loadMoreOn(request, theMatch).map { related =>
        val (matchReport, minByMin, preview, stats) = fetchRelatedMatchContent(theMatch, related)
        val canonicalPage = matchReport.orElse(minByMin).orElse { if (theMatch.isFixture) preview else None }.getOrElse(stats)
        Cached(60)(WithoutRevalidationResult(Found(canonicalPage.url)))
      }
    }.getOrElse {
      // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
      Future.successful(Cached(60)(WithoutRevalidationResult(Found("/football/results"))))
    }
  }

  //for our purposes we expect exactly 2 football teams
  private def hasExactlyTwoTeams(content: ContentType): Boolean = content.tags.tags.count(_.isFootballTeam) == 2

  private def fetchRelatedMatchContent(theMatch: FootballMatch, related: Seq[ContentType]):
    (Option[FootballMatchTrail], Option[FootballMatchTrail], Option[FootballMatchTrail], FootballMatchTrail) = {
    val matchDate = theMatch.date.toLocalDate
    val matchReport = related.find { c =>
      c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")) >= matchDate.toDateTimeAtStartOfDay &&
        c.matchReport && !c.minByMin && !c.preview
    }
    val minByMin = related.find { c =>
      c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")).toLocalDate == matchDate && c.minByMin && !c.preview
    }
    val preview = related.find { c =>
      c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")) <= matchDate.toDateTimeAtStartOfDay &&
        (c.preview || c.squadSheet) && !c.matchReport && !c.minByMin
    }
    val stats: FootballMatchTrail = FootballMatchTrail.toTrail(theMatch)
    (matchReport.map(FootballMatchTrail.toTrail), minByMin.map(FootballMatchTrail.toTrail), preview.map(FootballMatchTrail.toTrail), stats)
  }

  private def populateNavModel(theMatch: FootballMatch, related: Seq[ContentType])(implicit request: RequestHeader): MatchNav = {
    val (matchReport, minByMin, preview, stats) = fetchRelatedMatchContent(theMatch, related)

    val currentPage = request.getParameter("page").flatMap { pageId =>
      (stats :: List(matchReport, minByMin, preview).flatten).find(_.url.endsWith(pageId))
    }

    MatchNav(theMatch, matchReport, minByMin, preview, stats, currentPage)
  }
}
