package football.model

import common.{CanonicalLink, Edition}
import conf.Configuration
import experiments.ActiveExperiments
import football.controllers.FootballPage
import model.dotcomrendering.DotcomRenderingUtils.{assetURL, withoutNull}
import model.dotcomrendering.{Config, PageFooter, PageType, Trail}
import model.{Competition, CompetitionSummary}
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

import java.time.LocalDate
import java.time.format.DateTimeFormatter

case class CompetitionMatches(competitionSummary: CompetitionSummary, matches: List[FootballMatch])
case class MatchesByDateAndCompetition(date: LocalDate, competitionMatches: List[CompetitionMatches])

case class DotcomRenderingFootballDataModel(
    matchesList: Seq[MatchesByDateAndCompetition],
    nextPage: Option[String],
    previousPage: Option[String],
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
)

object DotcomRenderingFootballDataModel {
  def apply(
      request: RequestHeader,
      page: FootballPage,
      pageType: PageType,
      matchesList: Seq[MatchesByDateAndCompetition],
      nextPage: Option[String],
      previousPage: Option[String],
  ): DotcomRenderingFootballDataModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition)

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
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

    DotcomRenderingFootballDataModel(
      matchesList,
      nextPage,
      previousPage,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
    )
  }
  def getMatchesList(
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

object DotcomRenderingFootballDataModelImplicits {
  implicit val localDateWrites: Writes[LocalDate] = Writes[LocalDate] { date =>
    JsString(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
  }

  implicit val stageFormat: Writes[Stage] = Json.writes[Stage]
  implicit val roundFormat: Writes[Round] = Json.writes[Round]
  implicit val matchDayTeamFormat: Writes[MatchDayTeam] = Json.writes[MatchDayTeam]
  implicit val venueFormat: Writes[Venue] = Json.writes[Venue]
  implicit val paCompetitionFormat: Writes[PaCompetition] = Json.writes[PaCompetition]
  implicit val officialFormat: Writes[Official] = Json.writes[Official]

  // Writes for Fixture with a type discriminator
  implicit val fixtureWrites: Writes[Fixture] = Writes { fixture =>
    Json.writes[Fixture].writes(fixture).as[JsObject] + ("type" -> JsString("Fixture"))
  }

  // Writes for MatchDay with a type discriminator
  implicit val matchDayWrites: Writes[MatchDay] = Writes { matchDay =>
    Json.writes[MatchDay].writes(matchDay).as[JsObject] + ("type" -> JsString("MatchDay"))
  }

  // Writes for Result with a type discriminator
  implicit val resultWrites: Writes[Result] = Writes { result =>
    Json.writes[Result].writes(result).as[JsObject] + ("type" -> JsString("Result"))
  }

  // Writes for LiveMatch with a type discriminator
  implicit val liveMatchWrites: Writes[LiveMatch] = Writes { liveMatch =>
    Json.writes[LiveMatch].writes(liveMatch).as[JsObject] + ("type" -> JsString("LiveMatch"))
  }

  implicit val footballMatchWrites: Writes[FootballMatch] = Writes { matchInstance =>
    matchInstance match {
      case f: Fixture   => Json.toJson(f)(fixtureWrites)
      case m: MatchDay  => Json.toJson(m)(matchDayWrites)
      case r: Result    => Json.toJson(r)(resultWrites)
      case l: LiveMatch => Json.toJson(l)(liveMatchWrites)
    }
  }

  implicit val leagueStatsWrites: Writes[LeagueStats] = Json.writes[LeagueStats]
  implicit val leagueTeamWrites: Writes[LeagueTeam] = Json.writes[LeagueTeam]
  implicit val leagueTableEntryWrites: Writes[LeagueTableEntry] = Json.writes[LeagueTableEntry]

  implicit val competitionFormat: Writes[CompetitionSummary] = (competition: CompetitionSummary) =>
    Json.obj(
      "id" -> competition.id,
      "url" -> competition.url,
      "fullName" -> competition.fullName,
      "nation" -> competition.nation,
    )
  implicit val competitionMatchesFormat: Writes[CompetitionMatches] = Json.writes[CompetitionMatches]
  implicit val dateCompetitionMatchesFormat: Writes[MatchesByDateAndCompetition] =
    Json.writes[MatchesByDateAndCompetition]

  implicit val SportsFormat: Writes[DotcomRenderingFootballDataModel] = Json.writes[DotcomRenderingFootballDataModel]
}
