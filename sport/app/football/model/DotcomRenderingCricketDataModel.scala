package football.model

import common.{CanonicalLink, Edition}
import conf.Configuration
import cricket.controllers.CricketMatchPage
import cricketModel.{Innings, InningsBatter, InningsBowler, InningsWicket, Match, Team}
import experiments.ActiveExperiments
import model.ApplicationContext
import model.dotcomrendering.DotcomRenderingUtils.{assetURL, withoutNull}
import model.dotcomrendering.{Config, PageFooter, PageType}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, Writes}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

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
    )
  }

  implicit val dotcomRenderingCricketDataModelFormat: Writes[DotcomRenderingCricketDataModel] =
    Json.writes[DotcomRenderingCricketDataModel]

  def toJson(model: DotcomRenderingCricketDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }
}
