package football.model

import common.{CanonicalLink, Edition}
import conf.Configuration
import cricket.controllers.CricketMatchPage
import cricketModel.{Innings, InningsWicket, Match, Team}
import model.ApplicationContext
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import model.dotcomrendering.{DotcomRenderingConfig, PageFooter, PageType}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, Writes}
import play.api.mvc.RequestHeader

case class DotcomRenderingCricketDataModel(
    cricketMatch: Match,
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
    pageId: String,
    paId: String,
)

object DotcomRenderingCricketDataModel {
  def apply(
      page: CricketMatchPage,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingCricketDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)

    val pageType: PageType = PageType(page, request, context)

    val combinedConfig = DotcomRenderingConfig(
      page = page,
      request = request,
      isPreview = pageType.isPreview,
    )

    DotcomRenderingCricketDataModel(
      page.theMatch,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      pageId = page.metadata.id,
      paId = page.team.paId,
    )
  }

  implicit val dotcomRenderingCricketDataModelFormat: Writes[DotcomRenderingCricketDataModel] =
    Json.writes[DotcomRenderingCricketDataModel]

  def toJson(model: DotcomRenderingCricketDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }
}

object CricketScoreBoardDataModel {
  private def getTeam(team: Team) = {
    Json.obj(
      "name" -> team.name,
      "home" -> team.home,
    )
  }

  private def getFallOfWicket(inningsWicket: InningsWicket) = {
    Json.obj(
      "order" -> inningsWicket.order,
    )
  }

  private def getInnings(innings: Innings) = {
    Json.obj(
      "order" -> innings.order,
      "battingTeam" -> innings.battingTeam,
      "runsScored" -> innings.runsScored,
      "declared" -> innings.declared,
      "forfeited" -> innings.forfeited,
      "fallOfWicket" -> innings.fallOfWicket.map(getFallOfWicket),
      "overs" -> innings.overs,
    )
  }

  def getMatch(theMatch: Match): JsObject = {
    Json.obj(
      "matchId" -> theMatch.matchId,
      "competitionName" -> theMatch.competitionName,
      "venueName" -> theMatch.venueName,
      "teams" -> theMatch.teams.map(getTeam),
      "innings" -> theMatch.innings.map(getInnings),
      "gameDate" -> theMatch.gameDate,
    )
  }

  def toJson(theMatch: Match): JsValue = {
    val jsValue = Json.toJson(getMatch(theMatch))
    withoutNull(jsValue)
  }
}
