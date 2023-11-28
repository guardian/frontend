package model.dotcomrendering

import common.{CanonicalLink, Edition}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import com.gu.contentapi.client.model.v1.Content
import experiments.ActiveExperiments
import layout.ContentCard
import model.{SimplePage, RelatedContentItem}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}
import services.newsletters.model.NewsletterResponseV2
import services.NewsletterData

case class DotcomNewsletterDetailPageRenderingDataModel(
    newsletter: NewsletterData,
    backfillRecommendedNewsletters: List[NewsletterData],
    id: String,
    editionId: String,
    editionLongForm: String,
    beaconURL: String,
    subscribeUrl: String,
    contributionsServiceUrl: String,
    webTitle: String,
    description: Option[String],
    config: JsObject,
    openGraphData: Map[String, String],
    twitterData: Map[String, String],
    nav: Nav,
    commercialProperties: Map[String, EditionCommercialProperties],
    pageFooter: PageFooter,
    isAdFreeUser: Boolean,
    canonicalUrl: String,
)

object DotcomNewsletterDetailPageRenderingDataModel {
  implicit val writes = Json.writes[DotcomNewsletterDetailPageRenderingDataModel]

  def apply(
      page: SimplePage,
      newsletter: NewsletterResponseV2,
      backfillRecommendedNewsletters: List[NewsletterResponseV2],
      request: RequestHeader,
  ): DotcomNewsletterDetailPageRenderingDataModel = {
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
      ampIframeUrl = DotcomRenderingUtils.assetURL("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
    )

    val combinedConfig: JsObject = {
      val jsPageConfig: Map[String, JsValue] =
        JavaScriptPage.getMap(page, Edition(request), isPreview = false, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

    val commercialProperties = page.metadata.commercial
      .map { _.perEdition.mapKeys(_.id) }
      .getOrElse(Map.empty[String, EditionCommercialProperties])

    val backfillRecommendationData = backfillRecommendedNewsletters.map(_.toNewsletterData)

    DotcomNewsletterDetailPageRenderingDataModel(
      newsletter = newsletter.toNewsletterData,
      backfillRecommendedNewsletters = backfillRecommendationData,
      id = page.metadata.id,
      editionId = edition.id,
      editionLongForm = edition.displayName,
      beaconURL = Configuration.debug.beaconUrl,
      subscribeUrl = Configuration.id.subscribeUrl,
      contributionsServiceUrl = Configuration.contributionsService.url,
      webTitle = page.metadata.webTitle,
      description = page.metadata.description,
      config = combinedConfig,
      openGraphData = page.getOpenGraphProperties,
      twitterData = page.getTwitterProperties,
      nav = nav,
      commercialProperties = commercialProperties,
      pageFooter = PageFooter(FooterLinks.getFooterByEdition(Edition(request))),
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      canonicalUrl = CanonicalLink(request, page.metadata.webUrl),
    )
  }

  def toJson(model: DotcomNewsletterDetailPageRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }
}
