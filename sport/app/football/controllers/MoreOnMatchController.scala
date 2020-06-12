package football.controllers

import common._
import conf.Configuration
import contentapi.ContentApiClient
import feed.CompetitionsService
import football.model.FootballMatchTrail
import implicits.{Football, Requests}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{Cached, Competition, Content, ContentType, NoCache, TeamColours}
import org.joda.time.{DateTime, Days, LocalDate}
import org.joda.time.format.DateTimeFormat
import com.github.nscala_time.time.Imports
import com.github.nscala_time.time.Imports._
import pa.{FootballMatch, LineUp, LineUpTeam, MatchDayTeam}
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

/*
  Date: 12th June 2020
  Author: Pascal

  For the moment I am essentially reproducing here what I did for MatchController.scala
  If the two sets of classes turn our to be the same (or one an extension of the other) then I will move
  them to a single model file.
 */

sealed trait Ns1Answer
case class Event1Answer(eventTime: String, eventType: String) extends Ns1Answer
case class Player1Answer(id: String, name: String, position: String, lastName: String, substitute: Boolean, timeOnPitch: String, shirtNumber: String, events: Seq[EventAnswer]) extends Ns1Answer
case class Team1Answer(
   id: String,
   name: String,
   players: Seq[Player1Answer],
   score: Int,
   scorers: List[String],
   possession: Int,
   shotsOn: Int,
   shotsOff: Int,
   corners: Int,
   fouls: Int,
   colours: String,
   crest: String
) extends Ns1Answer
case class Competition1Answer(fullName: Option[String]) extends Ns1Answer
case class MatchData1Answer(
  id: String,
  isResult: Boolean,
  homeTeam: Team1Answer,
  awayTeam: Team1Answer,
  competition: Competition1Answer,
  isLive: Boolean,
  venue: String,
  comments: String
) extends Ns1Answer

object Ns1Answer {
  val reportedEventTypes = List("booking", "dismissal", "substitution")
  def make1Players(team: LineUpTeam): Seq[Player1Answer] = {
    team.players.map{ player =>
      val events = player.events.filter(event => NsAnswer.reportedEventTypes.contains(event.eventType)).map { event =>
        EventAnswer(event.eventTime, event.eventType)
      }
      Player1Answer(player.id, player.name, player.position, player.lastName, player.substitute, player.timeOnPitch, player.shirtNumber, events)
    }
  }
  def makeTeamAnswer(teamV1: MatchDayTeam, teamV2: LineUpTeam, teamPossession: Int, teamColour: String): Team1Answer = {
    val players = make1Players(teamV2)
    Team1Answer(
      teamV1.id,
      teamV1.name,
      players = players,
      score = teamV1.score.getOrElse(0),
      scorers = teamV1.scorers.fold(Nil: List[String])(_.split(",").map(scorer => {
        scorer.replace("(", "").replace(")", "")}).toList),
      possession = teamPossession,
      shotsOn = teamV2.shotsOn,
      shotsOff = teamV2.shotsOff,
      corners = teamV2.corners,
      fouls = teamV2.fouls,
      colours = teamColour,
      crest = s"${Configuration.staticSport.path}/football/crests/120/${teamV1.id}.png"
    )
  }
  def makeFromFootballMatch(theMatch: FootballMatch, lineUp: LineUp, competition: Option[Competition], isResult: Boolean, isLive: Boolean): MatchData1Answer = {
    val teamColours = TeamColours(lineUp.homeTeam, lineUp.awayTeam)
    MatchData1Answer(
      id = theMatch.id,
      isResult = isResult,
      homeTeam = makeTeamAnswer(theMatch.homeTeam, lineUp.homeTeam, lineUp.homeTeamPossession, teamColours.home),
      awayTeam = makeTeamAnswer(theMatch.awayTeam, lineUp.awayTeam, lineUp.awayTeamPossession, teamColours.away),
      competition = Competition1Answer(competition.map(_.fullName)),
      isLive = isLive,
      venue = theMatch.venue.map(_.name).getOrElse(""),
      comments = theMatch.comments.getOrElse("")
    )
  }

  implicit val EventAnswerWrites: Writes[Event1Answer] = Json.writes[Event1Answer]
  implicit val PlayerAnswerWrites: Writes[Player1Answer] = Json.writes[Player1Answer]
  implicit val TeamAnswerWrites: Writes[Team1Answer] = Json.writes[Team1Answer]
  implicit val CompetitionAnswerWrites: Writes[Competition1Answer] = Json.writes[Competition1Answer]
  implicit val MatchDataAnswerWrites: Writes[MatchData1Answer] = Json.writes[MatchData1Answer]
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

      lazy val competition = competitionsService.competitionForMatch(theMatch.id)

      for {
        filtered <- related map { _ filter hasExactlyTwoTeams }
        lineup <- competitionsService.getLineup(theMatch)
      } yield {
        Cached(if(theMatch.isLive) 10 else 300) {
          if (request.forceDCR) {
            JsonComponent(Json.toJson(Ns1Answer.makeFromFootballMatch(theMatch, lineup, competition, theMatch.isResult, theMatch.isLive)))
          } else {
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
      val dateOfPublication = c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London"))
      val dateOfMatch = theMatch.date.withZone(DateTimeZone.forID("Europe/London"))
      dateOfPublication.sameDay(dateOfMatch) && c.minByMin && !c.preview
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
