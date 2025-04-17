package football.model

import common.{CanonicalLink, Edition}
import conf.Configuration
import experiments.ActiveExperiments
import football.controllers.{MatchDataAnswer, MatchPage}
import model.ApplicationContext
import model.dotcomrendering.DotcomRenderingUtils.{assetURL, withoutNull}
import model.dotcomrendering.{Config, PageFooter, PageType}
import navigation.{FooterLinks, Nav}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

import scala.language.postfixOps

trait DotcomRenderingSummaryFootballDataModel {
  def footballMatch: MatchDataAnswer
  def nav: Nav
  def editionId: String
  def guardianBaseURL: String
  def config: JsObject
  def pageFooter: PageFooter
  def isAdFreeUser: Boolean
  def contributionsServiceUrl: String
  def canonicalUrl: String
}

private object DotcomRenderingSummaryFootballDataModel {
  def getConfig(page: MatchPage)(implicit
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

case class DotcomRenderingFootballMatchSummaryDataModel(
    footballMatch: MatchDataAnswer,
    nav: Nav,
    editionId: String,
    guardianBaseURL: String,
    config: JsObject,
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    contributionsServiceUrl: String,
    canonicalUrl: String,
) extends DotcomRenderingSummaryFootballDataModel

object DotcomRenderingFootballMatchSummaryDataModel {
  def apply(
      page: MatchPage,
      footballMatch: MatchDataAnswer,
  )(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): DotcomRenderingFootballMatchSummaryDataModel = {
    val edition = Edition(request)
    val nav = Nav(page, edition)
    val combinedConfig: JsObject = DotcomRenderingSummaryFootballDataModel.getConfig(page)
    DotcomRenderingFootballMatchSummaryDataModel(
      footballMatch = footballMatch,
      nav = nav,
      editionId = edition.id,
      guardianBaseURL = Configuration.site.host,
      config = combinedConfig,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
    )
  }

  implicit def dotcomRenderingFootballMatchSummaryDataModel: Writes[DotcomRenderingFootballMatchSummaryDataModel] =
    Json.writes[DotcomRenderingFootballMatchSummaryDataModel]

  def toJson(model: DotcomRenderingFootballMatchSummaryDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }
}
