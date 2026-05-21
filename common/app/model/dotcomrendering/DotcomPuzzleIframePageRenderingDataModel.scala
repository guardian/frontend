package model.dotcomrendering

import ab.ABTests
import common.{CanonicalLink, Edition}
import common.commercial.EditionCommercialProperties
import conf.Configuration
import experiments.ActiveExperiments
import model.SimplePage
import navigation.{FooterLinks, Nav}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

case class DotcomPuzzleIframePageRenderingDataModel(
    id: String,
    editionId: String,
    editionLongForm: String,
    contributionsServiceUrl: String,
    webTitle: String,
    description: Option[String],
    config: JsObject,
    nav: Nav,
    pageFooter: PageFooter,
    commercialProperties: Map[String, EditionCommercialProperties],
    isAdFreeUser: Boolean,
    canonicalUrl: String,
    puzzle: PuzzleItem,
)

object DotcomPuzzleIframePageRenderingDataModel {
  implicit val writes: OWrites[DotcomPuzzleIframePageRenderingDataModel] =
    Json.writes[DotcomPuzzleIframePageRenderingDataModel]

  def apply(
      page: SimplePage,
      puzzle: PuzzleItem,
      request: RequestHeader,
  ): DotcomPuzzleIframePageRenderingDataModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition)

    val switches = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean]) { (acc, switch) =>
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      }

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      serverSideABTests = ABTests.getParticipations(request),
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig =
      Json.toJsObject(config).deepMerge(
        JsObject(JavaScriptPage.getMap(page, edition, isPreview = false, request)),
      )

    val commercialProperties = page.metadata.commercial
      .map(_.perEdition.map { case (k, v) => k.id -> v })
      .getOrElse(Map.empty)

    DotcomPuzzleIframePageRenderingDataModel(
      id = page.metadata.id,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      contributionsServiceUrl = Configuration.contributionsService.url,
      webTitle = page.metadata.webTitle,
      description = page.metadata.description,
      config = combinedConfig,
      nav = nav,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
      commercialProperties = commercialProperties,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
      puzzle = puzzle,
    )
  }

  def toJson(model: DotcomPuzzleIframePageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
