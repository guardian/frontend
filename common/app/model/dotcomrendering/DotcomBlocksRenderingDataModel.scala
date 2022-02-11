package model.dotcomrendering

import com.gu.commercial.display.AdTargetParam.toMap
import com.gu.contentapi.client.model.v1.{Block => APIBlock}
import common.Edition
import conf.Configuration
import experiments.ActiveExperiments
import model.dotcomrendering.pageElements.PageElement
import model.{ContentFormat, ContentPage, LiveBlogPage}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

// -----------------------------------------------------------------
// DCR Blocks DataModel
// -----------------------------------------------------------------

case class DotcomBlocksRenderingDataModel(
    blocks: List[Block],
    format: ContentFormat,
    pageId: String,
    webTitle: String,
    isAdFreeUser: Boolean,
    config: JsObject,
    sharedAdTargeting: JsValue,
)

object DotcomBlocksRenderingDataModel {

  implicit val pageElementWrites = PageElement.pageElementWrites

  implicit val writes = new Writes[DotcomBlocksRenderingDataModel] {
    def writes(model: DotcomBlocksRenderingDataModel) = {
      val obj = Json.obj(
        "blocks" -> model.blocks,
        "format" -> model.format,
        "pageId" -> model.pageId,
        "webTitle" -> model.webTitle,
        "isAdFreeUser" -> model.isAdFreeUser,
        "config" -> model.config,
        "sharedAdTargeting" -> model.sharedAdTargeting,
        "filterKeyEvents" -> false,
      )

      ElementsEnhancer.enhanceBlocks(obj)
    }
  }

  def toJson(model: DotcomBlocksRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }

  def forLiveblog(
      page: LiveBlogPage,
      blocks: Seq[APIBlock],
      request: RequestHeader,
      requestedBlocks: Option[String] = None,
  ): DotcomBlocksRenderingDataModel = {

//    val bodyBlocks = DotcomRenderingUtils.blocksForLiveblogPage(page, blocks, requestedBlocks)

    apply(
      page,
      request,
      blocks,
    )
  }

  def apply(
      page: ContentPage,
      request: RequestHeader,
      bodyBlocks: Seq[APIBlock],
  ): DotcomBlocksRenderingDataModel = {
    val content = page.item
    val shouldAddAffiliateLinks = DotcomRenderingUtils.shouldAddAffiliateLinks(content)
    val contentDateTimes = DotcomRenderingUtils.contentDateTimes(content)

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

    val combinedConfig = {
      val jsPageConfig = JavaScriptPage.getMap(page, Edition(request), isPreview = false, request)
      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
    }

    val calloutsUrl = combinedConfig.fields.toList
      .find(entry => entry._1 == "calloutsUrl")
      .flatMap(_._2.asOpt[String])

    val bodyBlocksDCR: List[Block] = bodyBlocks
      .filter(_.published)
      .map(block =>
        Block(block, page, shouldAddAffiliateLinks, request, isMainBlock = false, calloutsUrl, contentDateTimes),
      )
      .toList

    DotcomBlocksRenderingDataModel(
      blocks = bodyBlocksDCR,
      format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      pageId = content.metadata.id,
      webTitle = content.metadata.webTitle,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      config = combinedConfig,
      sharedAdTargeting = (combinedConfig \ "sharedAdTargetting").getOrElse(JsObject.empty),
    )
  }
}
