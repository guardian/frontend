package model.dotcomrendering

import common.Edition
import common.Maps.RichMap
import common.commercial.EditionCommercialProperties
import conf.Configuration
import experiments.ActiveExperiments
import model.{MetaData, Tags}
import model.pressed.PressedContent
import navigation.{FooterLinks, Nav}
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.json.{JsObject, JsValue, Json, Writes, __}
import play.api.mvc.RequestHeader
import services.IndexPage
import views.support.{CamelCase, JavaScriptPage, PreviousAndNext}
import model.PressedCollectionFormat.pressedContentFormat

case class DotcomIndexPageRenderingDataModel(
    contents: Seq[PressedContent],
    tags: Tags,
    date: DateTime,
    tzOverride: Option[DateTimeZone],
    previousAndNext: Option[PreviousAndNext],
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
)

object DotcomIndexPageRenderingDataModel {

  implicit val writes = new Writes[DotcomIndexPageRenderingDataModel] {
    def writes(model: DotcomIndexPageRenderingDataModel) = {
      Json.obj(
        "contents" -> model.contents,
        "date" -> model.date.toString(),
        "tzOverride" -> model.tzOverride.map(_.toString),
        "previousAndNext" -> model.previousAndNext.map(previousAndNext =>
          Json.obj("prev" -> previousAndNext.prev, "next" -> previousAndNext.next),
        ),
        "tags" -> model.tags,
        "nav" -> model.nav,
        "editionId" -> model.editionId,
        "editionLongForm" -> model.editionLongForm,
        "guardianBaseURL" -> model.guardianBaseURL,
        "pageId" -> model.pageId,
        "webTitle" -> model.webTitle,
        "webURL" -> model.webURL,
        "config" -> model.config,
        "commercialProperties" -> model.commercialProperties,
        "pageFooter" -> model.pageFooter,
        "isAdFreeUser" -> model.isAdFreeUser,
      )
    }
  }

  def apply(
      page: IndexPage,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomIndexPageRenderingDataModel = {
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
        JavaScriptPage.getMap(page, Edition(request), pageType.isPreview, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

    val commercialProperties = page.metadata.commercial
      .map {
        _.perEdition.mapKeys(_.id)
      }
      .getOrElse(Map.empty[String, EditionCommercialProperties])

    DotcomIndexPageRenderingDataModel(
      contents = page.contents.map(_.faciaItem),
      tags = page.tags,
      date = page.date,
      tzOverride = page.tzOverride,
      previousAndNext = page.previousAndNext,
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
    )
  }
}
