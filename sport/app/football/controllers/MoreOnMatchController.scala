package football.controllers

import com.github.nscala_time.time.Imports._
import common._
import conf.Configuration
import contentapi.ContentApiClient
import feed.CompetitionsService
import football.datetime.DateHelpers
import football.model.{
  DotcomRenderingFootballHeaderDataModel,
  FootballMatchTrail,
  GuTeamCodes,
  MatchStats,
  MatchStatsSummary,
}
import implicits.{Football, Requests}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{CacheTime, Cached, Content, ContentType}
import pa.{FootballMatch, LineUpEnhanced}
import play.api.libs.json._
import play.api.mvc._
import model.CompetitionDisplayHelpers.cleanTeamNameNextGenApi

import java.time.ZonedDateTime
import scala.concurrent.Future

case class Interval(start: ZonedDateTime, end: ZonedDateTime) {
  def contains(dt: ZonedDateTime): Boolean = {
    (dt.isAfter(start) && dt.isBefore(end)) || dt.isEqual(
      start,
    ) // nb. don't check for equals end as Interval.contains which this replaces is not end-inclusive.
  }
}

object MatchMetadata extends Football {
  def fetchRelatedMatchContent(theMatch: FootballMatch, related: Seq[ContentType])(implicit
      request: RequestHeader,
  ): (Option[FootballMatchTrail], Option[FootballMatchTrail], Option[FootballMatchTrail], FootballMatchTrail) = {
    val matchDate = theMatch.date
    val matchReport = related.find { c =>
      val webPublicationDate =
        DateHelpers.asZonedDateTime(c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")))
      webPublicationDate.isAfter(DateHelpers.startOfDay(matchDate)) && c.matchReport && !c.minByMin && !c.preview
    }

    val minByMin = related.find { c =>
      c.minByMin && !c.preview
    }
    val preview = related.find { c =>
      val webPublicationDate =
        DateHelpers.asZonedDateTime(c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")))
      webPublicationDate.isBefore(
        DateHelpers.startOfDay(matchDate),
      ) && (c.preview || c.squadSheet) && !c.matchReport && !c.minByMin
    }
    val stats: FootballMatchTrail = FootballMatchTrail.toTrail(theMatch)
    (
      matchReport.map(FootballMatchTrail.toTrail),
      minByMin.map(FootballMatchTrail.toTrail),
      preview.map(FootballMatchTrail.toTrail),
      stats,
    )
  }
}

class MoreOnMatchController(
    val competitionsService: CompetitionsService,
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with Football
    with Requests
    with GuLogging
    with ImplicitControllerExecutionContext {

  def interval(contentDate: java.time.LocalDate): Interval = {
    val twoDaysAgo = DateHelpers.asZonedDateTime(contentDate).minusDays(2)
    val threeDaysAhead = DateHelpers.asZonedDateTime(contentDate).plusDays(3)
    Interval(twoDaysAgo, threeDaysAhead)
  }

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchHeaderJson(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] =
    Action.async { implicit request =>
      val contentDate = DateHelpers.parseLocalDate(year, month, day)
      val maybeResponse: Option[Future[Result]] =
        competitionsService.competitionMatchFor(interval(contentDate), team1, team2) map {
          case (competitionSummary, theMatch) =>
            val relatedContentTypes: Future[Seq[ContentType]] = loadMoreOn(request, theMatch)
            val filteredContentTypesFuture: Future[Seq[ContentType]] = relatedContentTypes map {
              _ filter hasExactlyTwoTeams
            }

            filteredContentTypesFuture.map { filtered =>
              val model = DotcomRenderingFootballHeaderDataModel(
                theMatch,
                competitionSummary,
                filtered,
              )
              Cached(
                if (theMatch.isAboutToStart || theMatch.isLive) CacheTime.Football else CacheTime.FootballLongCache,
              )(JsonComponent.fromWritable(model))
            }
        }
      maybeResponse.getOrElse(Future.successful(Cached(CacheTime.FootballMediumCache) { JsonNotFound() }))
    }

  // note team1 & team2 are the home and away team, but we do NOT know their order
  def matchStatsJson(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] =
    Action.async { implicit request =>
      val contentDate = DateHelpers.parseLocalDate(year, month, day)
      val maybeResponse: Option[Future[Result]] =
        competitionsService.matchFor(interval(contentDate), team1, team2) map { theMatch =>
          val maybeLineup: Future[LineUpEnhanced] = competitionsService.getLineupEnhanced(theMatch)

          maybeLineup.map(lineup => {
            val matchStats = MatchStats.statsFromFootballMatch(theMatch, lineup, theMatch.matchStatus)
            Cached(if (theMatch.isLive) CacheTime.Football else CacheTime.FootballLongCache)(
              JsonComponent.fromWritable(matchStats),
            )
          })
        }
      maybeResponse.getOrElse(Future.successful(Cached(CacheTime.FootballMediumCache) { JsonNotFound() }))
    }

  def matchStatsSummaryJson(
      year: String,
      month: String,
      day: String,
      team1: String,
      team2: String,
  ): Action[AnyContent] =
    Action.async { implicit request =>
      val contentDate = DateHelpers.parseLocalDate(year, month, day)
      val maybeResponse: Option[Future[Result]] =
        competitionsService.matchFor(interval(contentDate), team1, team2) map { theMatch =>
          val maybeLineup: Future[LineUpEnhanced] = competitionsService.getLineupEnhanced(theMatch)

          maybeLineup.map(lineup => {
            val matchStatsSummary =
              MatchStatsSummary.statsSummaryFromFootballMatch(theMatch, lineup)
            Cached(if (theMatch.isLive) CacheTime.Football else CacheTime.FootballLongCache)(
              JsonComponent.fromWritable(matchStatsSummary),
            )
          })
        }
      maybeResponse.getOrElse(Future.successful(Cached(CacheTime.FootballMediumCache) { JsonNotFound() }))
    }

  def moreOnJson(matchId: String): Action[AnyContent] = moreOn(matchId)
  def moreOn(matchId: String): Action[AnyContent] =
    Action.async { implicit request =>
      val maybeMatch: Option[FootballMatch] = competitionsService.findMatch(matchId)

      val maybeResponse: Option[Future[RevalidatableResult]] = maybeMatch map { theMatch =>
        loadMoreOn(request, theMatch) map {
          case Nil =>
            logInfoWithRequestId(s"Cannot load more for match id: ${theMatch.id}")
            JsonNotFound()
          case related =>
            JsonComponent(
              "nav" -> football.views.html.fragments.matchNav(
                populateNavModel(
                  theMatch,
                  related filter {
                    hasExactlyTwoTeams
                  },
                ),
              ),
            )
        }
      }

      val response: Future[RevalidatableResult] = maybeResponse.getOrElse(Future { JsonNotFound() })
      response map { Cached(60) }
    }

  def loadMoreOn(request: RequestHeader, theMatch: FootballMatch): Future[List[ContentType]] = {
    val matchDate = theMatch.date
    val startOfDateRange = DateHelpers.startOfDay(matchDate.minusDays(2))
    val endOfDateRange = DateHelpers.startOfDay(matchDate.plusDays(2))

    contentApiClient
      .getResponse(
        contentApiClient
          .search()
          .section("football")
          .tag(
            "tone/minutebyminute|tone/matchreports|football/series/squad-sheets|football/series/match-previews|football/series/saturday-clockwatch",
          )
          .fromDate(startOfDateRange.toInstant)
          .toDate(endOfDateRange.toInstant)
          .reference(s"pa-football-team/${theMatch.homeTeam.id},pa-football-team/${theMatch.awayTeam.id}"),
      )
      .map { response =>
        response.results.map(Content(_)).toList
      }
  }

  def redirectToMatchId(matchId: String): Action[AnyContent] =
    Action.async { implicit request =>
      val maybeMatch: Option[FootballMatch] = competitionsService.findMatch(matchId)
      canonicalRedirectForMatch(maybeMatch, request)
    }

  def redirectToMatch(year: String, month: String, day: String, home: String, away: String): Action[AnyContent] =
    Action.async { implicit request =>
      val contentDate = DateHelpers.parseLocalDate(year, month, day)
      val maybeMatch = competitionsService.matchFor(interval(contentDate), home, away)
      canonicalRedirectForMatch(maybeMatch, request)
    }

  def bigMatchSpecial(matchId: String): Action[AnyContent] =
    Action { implicit request =>
      val response = competitionsService.competitions
        .find { _.matches.exists(_.id == matchId) }
        .fold(JsonNotFound()) { competition =>
          val fMatch = competition.matches.find(_.id == matchId).head
          JsonComponent(football.views.html.fragments.matchSummary(fMatch, Some(competition), link = true))
        }
      Cached(CacheTime.FootballMediumCache)(response)
    }

  def matchSummaryMf2(year: String, month: String, day: String, team1: String, team2: String): Action[AnyContent] =
    Action.async { implicit request =>
      val contentDate = DateHelpers.parseLocalDate(year, month, day)

      val maybeResponse: Option[Future[Result]] =
        competitionsService.matchFor(interval(contentDate), team1, team2) map { theMatch =>
          val related: Future[Seq[ContentType]] = loadMoreOn(request, theMatch)
          // We are only interested in content with exactly 2 team tags
          related map { _ filter hasExactlyTwoTeams } map { filtered =>
            Cached(if (theMatch.isLive) CacheTime.Football else CacheTime.FootballLongCache) {
              lazy val competition = competitionsService.competitionForMatch(theMatch.id)

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
                      "scorers" -> theMatch.homeTeam.scorers
                        .getOrElse("")
                        .split(",")
                        .map(scorer => {
                          Json.obj(
                            "scorer" -> scorer.replace("(", "").replace(")", ""),
                          )
                        }),
                    ),
                    "awayTeam" -> Json.obj(
                      "name" -> theMatch.awayTeam.name,
                      "id" -> theMatch.awayTeam.id,
                      "score" -> theMatch.awayTeam.score,
                      "crest" -> s"${Configuration.staticSport.path}/football/crests/120/${theMatch.awayTeam.id}.png",
                      "scorers" -> theMatch.awayTeam.scorers
                        .getOrElse("")
                        .split(",")
                        .map(scorer => {
                          Json.obj(
                            "scorer" -> scorer.replace("(", "").replace(")", ""),
                          )
                        }),
                    ),
                    "competition" -> Json.obj(
                      "fullName" -> competition.map(_.fullName),
                    ),
                  ),
                ),
              )
            }
          }
        }

      maybeResponse.getOrElse(Future.successful(Cached(CacheTime.FootballMediumCache) { JsonNotFound() }))
    }

  private def canonicalRedirectForMatch(maybeMatch: Option[FootballMatch], request: RequestHeader)(implicit
      requestHeader: RequestHeader,
  ): Future[Result] = {
    maybeMatch
      .map { theMatch =>
        loadMoreOn(request, theMatch).map { related =>
          val (matchReport, minByMin, preview, stats) = MatchMetadata.fetchRelatedMatchContent(theMatch, related)
          val canonicalPage =
            matchReport.orElse(minByMin).orElse { if (theMatch.isFixture) preview else None }.getOrElse(stats)

          Cached(60)(WithoutRevalidationResult(Found(canonicalPage.url)))
        }
      }
      .getOrElse {
        // we do not keep historical data, so just redirect old stuff to the results page (see also MatchController)
        Future.successful(Cached(60)(WithoutRevalidationResult(Found("/football/results"))))
      }
  }

  // for our purposes we expect exactly 2 football teams
  private def hasExactlyTwoTeams(content: ContentType): Boolean = content.tags.tags.count(_.isFootballTeam) == 2

  private def populateNavModel(theMatch: FootballMatch, related: Seq[ContentType])(implicit
      request: RequestHeader,
  ): MatchNav = {
    val (matchReport, minByMin, preview, stats) = MatchMetadata.fetchRelatedMatchContent(theMatch, related)

    val currentPage = request.getParameter("page").flatMap { pageId =>
      (stats :: List(matchReport, minByMin, preview).flatten).find(_.url.endsWith(pageId))
    }

    MatchNav(theMatch, matchReport, minByMin, preview, stats, currentPage)
  }
}
