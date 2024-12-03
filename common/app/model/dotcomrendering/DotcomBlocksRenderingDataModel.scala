package model.dotcomrendering

import com.gu.commercial.display.AdTargetParamValue
import com.gu.contentapi.client.model.v1.{Block => APIBlock}
import common.Edition
import common.commercial.EditionAdTargeting.adTargetParamValueWrites
import conf.Configuration
import model.dotcomrendering.pageElements.PageElement
import model.{ContentFormat, ContentPage}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.CamelCase
import experiments.ActiveExperiments

// -----------------------------------------------------------------
// DCR Blocks DataModel
// -----------------------------------------------------------------

case class DotcomBlocksRenderingDataModel(
    blocks: List[Block],
    format: ContentFormat,
    pageId: String,
    webTitle: String,
    ajaxUrl: String,
    isAdFreeUser: Boolean,
    isSensitive: Boolean,
    edition: String,
    section: String,
    sharedAdTargeting: Map[String, AdTargetParamValue],
    adUnit: String,
    switches: Map[String, Boolean],
    abTests: Map[String, String],
)

object DotcomBlocksRenderingDataModel {

  implicit val pageElementWrites: Writes[PageElement] = PageElement.pageElementWrites

  implicit val writes: Writes[DotcomBlocksRenderingDataModel] = new Writes[DotcomBlocksRenderingDataModel] {
    def writes(model: DotcomBlocksRenderingDataModel) = {
      val obj = Json.obj(
        "blocks" -> model.blocks,
        "format" -> model.format,
        "pageId" -> model.pageId,
        "webTitle" -> model.webTitle,
        "ajaxUrl" -> model.ajaxUrl,
        "isAdFreeUser" -> model.isAdFreeUser,
        "isSensitive" -> model.isSensitive,
        "edition" -> model.edition,
        "section" -> model.section,
        "sharedAdTargeting" -> Json.toJson(model.sharedAdTargeting),
        "adUnit" -> model.adUnit,
        "switches" -> model.switches,
        "abTests" -> model.abTests,
      )

      ElementsEnhancer.enhanceBlocks(obj)
    }
  }

  def toJson(model: DotcomBlocksRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    DotcomRenderingUtils.withoutNull(jsValue)
  }

  def apply(
      page: ContentPage,
      request: RequestHeader,
      bodyBlocks: Seq[APIBlock],
  ): DotcomBlocksRenderingDataModel = {
    val content = page.item
    val shouldAddAffiliateLinks = DotcomRenderingUtils.shouldAddAffiliateLinks(content)
    val contentDateTimes = DotcomRenderingUtils.contentDateTimes(content)

    val edition = Edition(request)

    val calloutsUrl = Option(Configuration.journalism.calloutsUrl);

    val dcrTags = content.tags.tags.map(Tag.apply)

    val bodyBlocksDCR: List[Block] = bodyBlocks
      .filter(_.published)
      .map(block =>
        Block(
          block,
          page,
          shouldAddAffiliateLinks,
          request,
          isMainBlock = false,
          calloutsUrl,
          contentDateTimes,
          dcrTags,
        ),
      )
      .toList

    val switches: Map[String, Boolean] = conf.switches.Switches.all
      .filter(_.exposeClientSide)
      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
      })

    DotcomBlocksRenderingDataModel(
      blocks = bodyBlocksDCR,
      format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      pageId = content.metadata.id,
      webTitle = content.metadata.webTitle,
      ajaxUrl = Configuration.ajax.url,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      isSensitive = content.metadata.sensitive,
      edition = edition.id,
      section = content.metadata.sectionId,
      sharedAdTargeting =
        content.metadata.commercial.map(_.adTargeting(edition)).getOrElse(Set.empty).map(f => (f.name, f.value)).toMap,
      adUnit = content.metadata.adUnitSuffix,
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
    )
  }
}
