package model.dotcomrendering

import ab.ABTests
import common.{CanonicalLink, Edition}
import common.commercial.EditionCommercialProperties
import conf.Configuration
import model.SimplePage
import navigation.{FooterLinks, Nav}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

case class CrosswordArchiveEntry(
    date: String,
    url: String,
)

object CrosswordArchiveEntry {
  implicit val writes: OWrites[CrosswordArchiveEntry] = Json.writes[CrosswordArchiveEntry]
}

case class CrosswordArchiveSection(
    title: String,
    cadence: String,
    crosswordType: String,
    moreUrl: String,
    entries: Seq[CrosswordArchiveEntry],
)

object CrosswordArchiveSection {
  implicit val writes: OWrites[CrosswordArchiveSection] = Json.writes[CrosswordArchiveSection]
}

case class DotcomCrosswordArchivePageRenderingDataModel(
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
    sections: Seq[CrosswordArchiveSection],
)

object DotcomCrosswordArchivePageRenderingDataModel {
  implicit val writes: OWrites[DotcomCrosswordArchivePageRenderingDataModel] =
    Json.writes[DotcomCrosswordArchivePageRenderingDataModel]

  def apply(
      page: SimplePage,
      sections: Seq[CrosswordArchiveSection],
      request: RequestHeader,
  ): DotcomCrosswordArchivePageRenderingDataModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition)

    val switches = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean]) { (acc, switch) =>
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      }

    val config = Config(
      switches = switches,
      serverSideABTests = ABTests.getParticipations(request),
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig =
      Json
        .toJsObject(config)
        .deepMerge(
          JsObject(JavaScriptPage.getMap(page, edition, isPreview = false, request)),
        )

    val commercialProperties = page.metadata.commercial
      .map(_.perEdition.map { case (k, v) => k.id -> v })
      .getOrElse(Map.empty)

    DotcomCrosswordArchivePageRenderingDataModel(
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
      sections = sections,
    )
  }

  def toJson(model: DotcomCrosswordArchivePageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
