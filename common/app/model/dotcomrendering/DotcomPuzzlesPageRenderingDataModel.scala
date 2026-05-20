package model.dotcomrendering

import ab.ABTests
import common.{CanonicalLink, Edition}
import common.commercial.EditionCommercialProperties
import conf.Configuration
import experiments.ActiveExperiments
import model.SimplePage
import navigation.{FooterLinks, Nav}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

case class PuzzleItem(
    title: String,
    `type`: String,
    set: String,
    url: Option[String] = None,
    image: Option[String] = None,
    index: Option[Int] = None,
    variant: Option[String] = None,
)

object PuzzleItem {
  implicit val format: OFormat[PuzzleItem] = Json.format[PuzzleItem]
}

case class PuzzleContent(
    items: Seq[Seq[PuzzleItem]],
    nestedContainers: Seq[PuzzleContainer],
)

object PuzzleContent {
  implicit lazy val format: OFormat[PuzzleContent] = (
    (__ \ "items").format[Seq[Seq[PuzzleItem]]] and
      (__ \ "nestedContainers").lazyFormat[Seq[PuzzleContainer]](Format.of[Seq[PuzzleContainer]])
  )(PuzzleContent.apply, unlift(PuzzleContent.unapply))
}

case class PuzzleContainer(
    title: String,
    variant: Option[String] = None,
    content: PuzzleContent,
)

object PuzzleContainer {
  implicit lazy val format: OFormat[PuzzleContainer] = (
    (__ \ "title").format[String] and
      (__ \ "variant").formatNullable[String] and
      (__ \ "content").lazyFormat[PuzzleContent](PuzzleContent.format)
  )(PuzzleContainer.apply, unlift(PuzzleContainer.unapply))
}

case class PuzzlesLayout(
    containers: Seq[PuzzleContainer],
)

object PuzzlesLayout {
  implicit lazy val format: OFormat[PuzzlesLayout] = Json.format[PuzzlesLayout]
}

case class DotcomPuzzlesPageRenderingDataModel(
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
    layout: PuzzlesLayout,
)

object DotcomPuzzlesPageRenderingDataModel {
  implicit val writes: OWrites[DotcomPuzzlesPageRenderingDataModel] =
    Json.writes[DotcomPuzzlesPageRenderingDataModel]

  def apply(
      page: SimplePage,
      layout: PuzzlesLayout,
      request: RequestHeader,
  ): DotcomPuzzlesPageRenderingDataModel = {
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

    DotcomPuzzlesPageRenderingDataModel(
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
      layout = layout,
    )
  }

  def toJson(model: DotcomPuzzlesPageRenderingDataModel): JsValue =
    DotcomRenderingUtils.withoutNull(Json.toJson(model))
}
