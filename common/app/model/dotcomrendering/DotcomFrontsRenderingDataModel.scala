package model.dotcomrendering

import com.gu.facia.client.models.CustomSubnav
import common.{CanonicalLink, Edition, GuLogging}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import model.{PressedPage, RelatedContentItem}
import model.pressed.{CuratedContent, PressedContent, SupportingCuratedContent}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader

case class DotcomFrontsRenderingDataModel(
    pressedPage: PressedPage,
    nav: Nav,
    editionId: String,
    editionLongForm: String,
    guardianBaseURL: String,
    pageId: String,
    webTitle: String,
    webURL: String,
    config: JsObject,
    commercialProperties: Map[String, EditionCommercialProperties],
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    isNetworkFront: Boolean,
    mostViewed: Seq[Trail],
    deeplyRead: Option[Seq[Trail]],
    contributionsServiceUrl: String,
    canonicalUrl: String,
)

object DotcomFrontsRenderingDataModel extends GuLogging {
  implicit val writes: OWrites[DotcomFrontsRenderingDataModel] = Json.writes[DotcomFrontsRenderingDataModel]

  def apply(
      page: PressedPage,
      request: RequestHeader,
      pageType: PageType,
      mostViewed: Seq[RelatedContentItem],
      deeplyRead: Option[Seq[Trail]],
      customSubnav: Option[CustomSubnav],
  ): DotcomFrontsRenderingDataModel = {
    val edition = Edition.edition(request)
    val nav = Nav(page, edition, request, customSubnav)

    val combinedConfig = DotcomRenderingConfig(
      page = page,
      request = request,
      isPreview = pageType.isPreview,
    )

    val commercialProperties = page.metadata.commercial
      .map { _.perEdition.mapKeys(_.id) }
      .getOrElse(Map.empty[String, EditionCommercialProperties])

    def stripDataForDcr(content: PressedContent): PressedContent =
      content.withoutCommercial match {
        case curated: CuratedContent              => curated.withoutTestPII
        case supporting: SupportingCuratedContent => supporting.withoutTestPII
        case unchanged: PressedContent            => unchanged
      }

    val lighterPage = page.copy(collections =
      page.collections.map(collection =>
        collection.copy(
          curated = collection.curated.map(stripDataForDcr),
          backfill = collection.backfill.map(stripDataForDcr),
        ),
      ),
    )

    if (Configuration.environment.isDev) {
      def logMiniNav(content: PressedContent, collectionId: String, source: String): Unit = {
        log.info(
          s"[mini-nav] DCR front=${page.metadata.id} preview=${pageType.isPreview} " +
            s"collection=$collectionId source=$source cardId=${content.card.id} " +
            s"showMiniNav=${content.display.showMiniNav} miniNavId=${content.display.miniNavData.map(_.id)} " +
            s"miniNavLinks=${content.display.miniNavData.map(_.links.size)}",
        )
        content match {
          case curated: CuratedContent =>
            curated.supportingContent.foreach(logMiniNav(_, collectionId, s"$source/supporting"))
          case _ =>
        }
      }

      log.info(s"[mini-nav] DCR front=${page.metadata.id} collections=${lighterPage.collections.size}")
      lighterPage.collections.foreach { collection =>
        collection.curated.foreach(logMiniNav(_, collection.id, "curated"))
        collection.backfill.foreach(logMiniNav(_, collection.id, "backfill"))
        collection.treats.foreach(logMiniNav(_, collection.id, "treats"))
      }
    }

    DotcomFrontsRenderingDataModel(
      pressedPage = lighterPage,
      nav = nav,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      guardianBaseURL = Configuration.site.host,
      pageId = page.metadata.id,
      webTitle = page.metadata.webTitle,
      webURL = page.metadata.webUrl,
      config = combinedConfig,
      commercialProperties = commercialProperties,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      isNetworkFront = page.isNetworkFront,
      mostViewed = mostViewed.map(content => Trail.pressedContentToTrail(content.faciaContent)(request)),
      deeplyRead = deeplyRead,
      contributionsServiceUrl = Configuration.contributionsService.url,
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
    )
  }

  def toJson(model: DotcomFrontsRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    DotcomRenderingUtils.withoutNull(jsValue)
  }
}
