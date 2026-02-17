package football.model

import common.{CanonicalLink, Edition, LinkTo}
import conf.Configuration
import experiments.ActiveExperiments
import football.controllers.{CompetitionFilter, FootballPage, MatchMetadata, MatchPage}
import model.content.InteractiveAtom
import model.dotcomrendering.DotcomRenderingUtils.{
  assetURL,
  getMatchHeaderUrl,
  getMatchNavUrl,
  withoutDeepNull,
  withoutNull,
}
import model.dotcomrendering.{Config, PageFooter, PageType}
import model.{ApplicationContext, Competition, CompetitionSummary, ContentType, Group, StandalonePage, Table, TeamUrl}
import navigation.{FooterLinks, Nav}
import pa.{
  Fixture,
  FootballMatch,
  LeagueStats,
  LeagueTableEntry,
  LeagueTeam,
  LiveMatch,
  MatchDay,
  MatchDayTeam,
  Official,
  Result,
  Round,
  Stage,
  Venue,
  Competition => PaCompetition,
}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}
import ab.ABTests
import org.joda.time.{LocalDate => JodaLocalDate}

import java.time.LocalDate
import java.time.format.DateTimeFormatter

case class TeamScore(id: String, name: String, score: Option[Int])
case class TeamResult(matchId: String, self: TeamScore, foe: TeamScore)

case class CompetitionMatches(competitionSummary: CompetitionSummary, matches: List[FootballMatch])
case class MatchesByDateAndCompetition(date: LocalDate, competitionMatches: List[CompetitionMatches])

trait DotcomRenderingFootballDataModel {
  def nav: Nav
  def editionId: String
  def guardianBaseURL: String
  def config: JsObject
  def pageFooter: PageFooter
  def isAdFreeUser: Boolean
  def contributionsServiceUrl: String
  def canonicalUrl: String
  def pageId: String
}

object DotcomRenderingFootballDataModel {
  def getConfig(page: StandalonePage)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): JsObject = {
    val pageType: PageType = PageType(page, request, context)

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      serverSideABTests = ABTests.allTests,
      ampIframeUrl = assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] =
        JavaScriptPage.getMap(page, Edition(request), pageType.isPreview, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }
    combinedConfig
  }
}

private object DotcomRenderingFootballDataModelImplicits {
  implicit val localDateWrites: Writes[LocalDate] = Writes[LocalDate] { date =>
    JsString(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
  }

  implicit val stageFormat: Writes[Stage] = Json.writes[Stage]
  implicit val roundFormat: Writes[Round] = Json.writes[Round]
  implicit val venueFormat: Writes[Venue] = Json.writes[Venue]
  implicit val paCompetitionFormat: Writes[PaCompetition] = Json.writes[PaCompetition]
  implicit val officialFormat: Writes[Official] = Json.writes[Official]

  implicit val leagueStatsWrites: Writes[LeagueStats] = Json.writes[LeagueStats]
  implicit val leagueTeamWrites: Writes[LeagueTeam] = Json.writes[LeagueTeam]
  implicit val leagueTableEntryWrites: Writes[LeagueTableEntry] = Json.writes[LeagueTableEntry]

  implicit val atomFormat: Writes[InteractiveAtom] = Json.writes[InteractiveAtom]

  private implicit val matchDayTeamFormat: Writes[MatchDayTeam] = Json.writes[MatchDayTeam]

  // Writes for Fixture with a type discriminator
  private implicit val fixtureWrites: Writes[Fixture] = Writes { fixture =>
    Json.writes[Fixture].writes(fixture).as[JsObject] + ("type" -> JsString("Fixture"))
  }

  // Writes for MatchDay with a type discriminator
  private implicit val matchDayWrites: Writes[MatchDay] = Writes { matchDay =>
    Json.writes[MatchDay].writes(matchDay).as[JsObject] + ("type" -> JsString("MatchDay"))
  }

  // Writes for Result with a type discriminator
  private implicit val resultWrites: Writes[Result] = Writes { result =>
    Json.writes[Result].writes(result).as[JsObject] + ("type" -> JsString("Result"))
  }

  // Writes for LiveMatch with a type discriminator
  private implicit val liveMatchWrites: Writes[LiveMatch] = Writes { liveMatch =>
    Json.writes[LiveMatch].writes(liveMatch).as[JsObject] + ("type" -> JsString("LiveMatch"))
  }

  implicit val footballMatchWrites: Writes[FootballMatch] = Writes {
    case f: Fixture   => Json.toJson(f)(fixtureWrites)
    case m: MatchDay  => Json.toJson(m)(matchDayWrites)
    case r: Result    => Json.toJson(r)(resultWrites)
    case l: LiveMatch => Json.toJson(l)(liveMatchWrites)
  }

  implicit val competitionFormat: Writes[CompetitionSummary] = (competition: CompetitionSummary) =>
    Json.obj(
      "id" -> competition.id,
      "url" -> competition.url,
      "fullName" -> competition.fullName,
      "nation" -> competition.nation,
      "tableDividers" -> competition.tableDividers,
    )

  private implicit val competitionMatchesFormat: Writes[CompetitionMatches] = Json.writes[CompetitionMatches]
  implicit val dateCompetitionMatchesFormat: Writes[MatchesByDateAndCompetition] =
    Json.writes[MatchesByDateAndCompetition]

  implicit val competitionFilterFormat: Writes[CompetitionFilter] = Json.writes[CompetitionFilter]
}

case class DotcomRenderingFootballMatchListDataModel(
    matchesList: Seq[MatchesByDateAndCompetition],
    nextPage: Option[String],
    nextPageNoJs: Option[String],
    filters: Map[String, Seq[CompetitionFilter]],
    previousPage: Option[String],
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
    pageId: String,
    atom: Option[InteractiveAtom],
) extends DotcomRenderingFootballDataModel

object DotcomRenderingFootballMatchListDataModel {
  def apply(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingFootballMatchListDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)
    val combinedConfig: JsObject = DotcomRenderingFootballDataModel.getConfig(page)

    val matches =
      getMatchesList(matchesList.matchesGroupedByDateAndCompetition)

    DotcomRenderingFootballMatchListDataModel(
      matchesList = matches,
      nextPage = matchesList.nextPage,
      nextPageNoJs = matchesList.nextPageNoJs,
      filters = filters,
      previousPage = matchesList.previousPage,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      pageId = page.metadata.id,
      atom = atom,
    )
  }

  import football.model.DotcomRenderingFootballDataModelImplicits._

  implicit def dotcomRenderingFootballMatchListDataModel: Writes[DotcomRenderingFootballMatchListDataModel] =
    Json.writes[DotcomRenderingFootballMatchListDataModel]

  def toJson(model: DotcomRenderingFootballMatchListDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }

  private def getMatchesList(
      matches: Seq[(LocalDate, List[(Competition, List[FootballMatch])])],
  ): Seq[MatchesByDateAndCompetition] = {
    matches.map { case (date, competitionMatches) =>
      MatchesByDateAndCompetition(
        date = date,
        competitionMatches = competitionMatches.map { case (competition, matches) =>
          CompetitionMatches(
            competitionSummary = competition,
            matches = matches,
          )
        },
      )
    }
  }
}

case class DotcomRenderingFootballHeaderDataModel(
    footballMatch: FootballMatch,
    competitionName: String,
    liveURL: Option[String],
    reportURL: Option[String],
    infoURL: String,
)

object DotcomRenderingFootballHeaderDataModel {
  import football.model.DotcomRenderingFootballDataModelImplicits._

  def apply(theMatch: FootballMatch, competitionSummary: CompetitionSummary, related: Seq[ContentType])(implicit
      request: RequestHeader,
  ): DotcomRenderingFootballHeaderDataModel = {
    val (maybeMatchReport, maybeMinByMin, _, matchInfo) = MatchMetadata.fetchRelatedMatchContent(theMatch, related)
    DotcomRenderingFootballHeaderDataModel(
      footballMatch = theMatch,
      competitionName = competitionSummary.fullName,
      liveURL = maybeMinByMin.map(x => LinkTo(x.url)),
      reportURL = maybeMatchReport.map(x => LinkTo(x.url)),
      infoURL = LinkTo(matchInfo.url),
    )
  }

  implicit def DotcomRenderingFootballHeaderDataModelWrites: Writes[DotcomRenderingFootballHeaderDataModel] =
    Json.writes[DotcomRenderingFootballHeaderDataModel]
}

case class DotcomRenderingFootballTablesDataModel(
    tables: Seq[Table],
    filters: Map[String, Seq[CompetitionFilter]],
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
    pageId: String,
    atom: Option[InteractiveAtom],
) extends DotcomRenderingFootballDataModel

object DotcomRenderingFootballTablesDataModel {
  def apply(
      page: FootballPage,
      tables: Seq[Table],
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingFootballTablesDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)
    val combinedConfig: JsObject = DotcomRenderingFootballDataModel.getConfig(page)

    DotcomRenderingFootballTablesDataModel(
      tables = tables,
      filters = filters,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      pageId = page.metadata.id,
      atom = atom,
    )
  }

  import football.model.DotcomRenderingFootballDataModelImplicits._

  private def getEntries(competition: Competition, group: Group): Seq[JsObject] = {
    group.entries.map { entry =>
      Json.obj(
        "stageNumber" -> entry.stageNumber,
        "round" -> entry.round,
        "team" -> entry.team,
        "teamUrl" -> TeamUrl(entry.team),
        "results" ->
          competition
            .teamResults(entry.team.id)
            .takeRight(5)
            .map(result =>
              TeamResult(
                matchId = result.matchId,
                self = TeamScore(result.self.id, result.self.name, result.self.score),
                foe = TeamScore(result.foe.id, result.foe.name, result.foe.score),
              ),
            ),
      )
    }
  }

  private implicit val teamScoreFormat: Writes[TeamScore] = Json.writes[TeamScore]
  private implicit val teamResultFormat: Writes[TeamResult] = Json.writes[TeamResult]

  private implicit val tableWrites: Writes[Table] = (table: Table) =>
    withoutDeepNull(
      Json.obj(
        "competition" -> Json.toJson(table.competition: CompetitionSummary),
        "groups" -> table.groups.map { group =>
          Json.obj(
            "round" -> group.round,
            "entries" -> getEntries(table.competition, group),
          )
        },
        "hasGroups" -> table.multiGroup,
      ),
    )

  implicit def dotcomRenderingFootballTablesDataModel: Writes[DotcomRenderingFootballTablesDataModel] =
    Json.writes[DotcomRenderingFootballTablesDataModel]

  def toJson(model: DotcomRenderingFootballTablesDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }
}

case class DotcomRenderingFootballMatchSummaryDataModel(
    // this field will need to get renamed to matchStats in upcoming PR
    footballMatch: MatchStats,
    matchInfo: FootballMatch,
    group: Option[Group],
    competitionName: String,
    matchUrl: String,
    matchHeaderUrl: String,
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

object DotcomRenderingFootballMatchSummaryDataModel {
  def apply(
      page: MatchPage,
      matchStats: MatchStats,
      matchInfo: FootballMatch,
      group: Option[Group],
      competitionName: String,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingFootballMatchSummaryDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)
    val combinedConfig: JsObject = DotcomRenderingFootballDataModel.getConfig(page)
    DotcomRenderingFootballMatchSummaryDataModel(
      footballMatch = matchStats,
      matchInfo = matchInfo,
      group = group,
      competitionName = competitionName,
      matchUrl = matchUrl(matchInfo, page),
      matchHeaderUrl = matchHeaderUrl(matchInfo, page),
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

  private def matchUrl(theMatch: FootballMatch, page: MatchPage) = {
    val (homeId, awayId) = (theMatch.homeTeam.id, theMatch.awayTeam.id)
    val localDate = new JodaLocalDate(theMatch.date.getYear, theMatch.date.getMonthValue, theMatch.date.getDayOfMonth)

    getMatchNavUrl(Configuration.ajax.url, localDate, homeId, awayId, page.metadata.id)
  }

  private def matchHeaderUrl(theMatch: FootballMatch, page: MatchPage) = {
    val (homeId, awayId) = (theMatch.homeTeam.id, theMatch.awayTeam.id)
    val localDate = new JodaLocalDate(theMatch.date.getYear, theMatch.date.getMonthValue, theMatch.date.getDayOfMonth)

    getMatchHeaderUrl(Configuration.ajax.url, localDate, homeId, awayId)
  }

  import football.model.DotcomRenderingFootballDataModelImplicits._

  private def getGroupEntries(group: Group): Seq[JsObject] = {
    group.entries.map { entry =>
      Json.obj(
        "stageNumber" -> entry.stageNumber,
        "round" -> entry.round,
        "team" -> entry.team,
        "teamUrl" -> TeamUrl(entry.team),
      )
    }
  }
  implicit val groupWrites: Writes[Group] = (group: Group) =>
    withoutDeepNull(
      Json.obj(
        "round" -> group.round,
        "entries" -> getGroupEntries(group),
      ),
    )

  implicit def dotcomRenderingFootballMatchSummaryDataModel: Writes[DotcomRenderingFootballMatchSummaryDataModel] =
    Json.writes[DotcomRenderingFootballMatchSummaryDataModel]

  def toJson(model: DotcomRenderingFootballMatchSummaryDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }
}
