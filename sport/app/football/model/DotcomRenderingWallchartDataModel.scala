package football.model

import common.{CanonicalLink, Edition}
import conf.Configuration
import football.controllers.FootballPage
import football.model.DotcomRenderingFootballDataModelImplicits._
import model.{ApplicationContext, Competition, CompetitionSummary}
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import model.dotcomrendering.PageFooter
import navigation.{FooterLinks, Nav}
import pa.{FootballMatch, Round}
import play.api.libs.json.{JsObject, JsString, JsValue, Json, Writes}
import play.api.mvc.RequestHeader

import java.time.LocalDate

case class MatchesByDate(date: LocalDate, matches: List[FootballMatch])

case class DotcomRenderingWallchartDataModel(
    competitionStages: List[CompetitionStageLike],
    competition: Competition,
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
    pageId: String,
) extends DotcomRenderingFootballDataModel

object DotcomRenderingWallchartDataModel {
  def apply(
      page: FootballPage,
      competitionStages: List[CompetitionStageLike],
      competition: Competition,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingWallchartDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)
    val combinedConfig: JsObject = DotcomRenderingFootballDataModel.getConfig(page)
    DotcomRenderingWallchartDataModel(
      competitionStages = competitionStages,
      competition = competition,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      pageId = page.metadata.id,
    )
  }

  implicit val matchesByDateWrites: Writes[MatchesByDate] =
    Json.writes[MatchesByDate]

  def toJson(model: DotcomRenderingWallchartDataModel)(implicit
      request: RequestHeader,
  ): JsValue = {
    val competitionStagesJson = model.competitionStages.map {
      case spider: KnockoutSpider =>
        getKnockoutSpider(spider, model.competition).+("type" -> JsString("knockoutSpider"))

      case groups: Groups =>
        getGroups(groups, model.competition).+("type" -> JsString("groups"))

      case league: League =>
        getLeague(league).+("type" -> JsString("league"))

      case knockoutList: KnockoutList =>
        getKnockoutList(knockoutList, model.competition).+("type" -> JsString("knockoutList"))

    }

    val json = Json.obj(
      "competition" -> Json.toJson(model.competition: CompetitionSummary),
      "competitionStages" -> competitionStagesJson,
      "nav" -> Json.toJson(model.nav),
      "editionId" -> model.editionId,
      "guardianBaseURL" -> model.guardianBaseURL,
      "config" -> model.config,
      "pageFooter" -> Json.toJson(model.pageFooter),
      "isAdFreeUser" -> model.isAdFreeUser,
      "contributionsServiceUrl" -> model.contributionsServiceUrl,
      "canonicalUrl" -> model.canonicalUrl,
      "pageId" -> model.pageId,
    )
    withoutNull(json)
  }

  private def getKnockoutSpider(spider: KnockoutSpider, competition: Competition)(implicit
      request: RequestHeader,
  ) = {
    Json.obj(
      "rounds" -> spider.rounds.map(round => spiderRoundWithMatches(round, spider, competition)),
    )
  }

  private def getGroups(groups: Groups, competition: Competition)(implicit
      request: RequestHeader,
  ) = {
    val groupTables = groups.groupTables
    Json.obj(
      "groupTables" -> groupTables.map { table =>
        Json.obj(
          "round" -> table._1,
          "entries" -> table._2,
          "matches" -> getMatchesList(groups.matchesList(competition, table._1).matchesGroupedByDateAndCompetition),
        )
      },
    )
  }

  private def getLeague(league: League) = {
    Json.obj(
      "leagueTable" -> league.leagueTable,
    )
  }

  private def getKnockoutList(knockoutList: KnockoutList, competition: Competition)(implicit
      request: RequestHeader,
  ) = {
    Json.obj(
      "rounds" -> knockoutList.rounds.map(round =>
        Json.obj(
          "matchesByDate" -> getMatchesList(
            knockoutList.matchesList(competition, round).matchesGroupedByDateAndCompetition,
          ),
        ),
      ),
    )
  }

  private def spiderRoundWithMatches(round: Round, spider: KnockoutSpider, competition: Competition)(implicit
      request: RequestHeader,
  ): JsObject = Json.obj(
    "roundNumber" -> round.roundNumber,
    "name" -> round.name,
    "matches" -> spider.roundMatches(round),
    "matchesByDate" ->
      getMatchesList(spider.matchesList(competition, round).matchesGroupedByDateAndCompetition),
    "isActiveRound" -> spider.isActiveRound(round),
  )

  private def getMatchesList(
      matches: Seq[(LocalDate, List[(Competition, List[FootballMatch])])],
  ): Seq[MatchesByDate] = {
    matches.map { case (date, competitionMatches) =>
      MatchesByDate(
        date = date,
        matches = competitionMatches.flatMap { case (_, matches) =>
          matches
        },
      )
    }
  }
}
