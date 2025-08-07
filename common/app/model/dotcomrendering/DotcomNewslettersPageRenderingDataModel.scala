package model.dotcomrendering

import common.{CanonicalLink, Edition}
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import com.gu.contentapi.client.model.v1.Content
import experiments.ActiveExperiments
import layout.ContentCard
import model.{RelatedContentItem, SimplePage}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.{JsObject, JsValue, Json, OWrites}
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}
import services.newsletters.model.{NewsletterResponseV2, NewsletterLayout}
import services.NewsletterData
import ab.ABTests

case class DotcomNewslettersPageRenderingDataModel(
    newsletters: List[NewsletterData],
    layout: Option[NewsletterLayout],
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

object DotcomNewslettersPageRenderingDataModel {
  implicit val writes: OWrites[DotcomNewslettersPageRenderingDataModel] =
    Json.writes[DotcomNewslettersPageRenderingDataModel]

  def apply(
      page: SimplePage,
      newsletters: List[NewsletterResponseV2],
      layout: Option[NewsletterLayout],
      request: RequestHeader,
  ): DotcomNewslettersPageRenderingDataModel = {
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
      serverSideABTests = ABTests.allTests(request),
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

    val newsletterData = newsletters
      .filter((newsletter) => newsletter.status.equalsIgnoreCase(("live")))
      .map((newsletter) => convertNewsletterResponseToData(newsletter))

    DotcomNewslettersPageRenderingDataModel(
      newsletters = newsletterData,
      layout = layout,
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

  def toJson(model: DotcomNewslettersPageRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    DotcomRenderingUtils.withoutNull(jsValue)
  }

  private def convertNewsletterResponseToData(response: NewsletterResponseV2): NewsletterData = {
    NewsletterData(
      response.identityName,
      response.name,
      response.theme,
      response.signUpDescription,
      response.frequency,
      response.listId,
      response.group,
      response.mailSuccessDescription.getOrElse("You are subscribed"),
      response.regionFocus,
      response.illustrationCard,
    )
  }
}
