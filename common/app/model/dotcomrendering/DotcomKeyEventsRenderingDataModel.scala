package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block => APIBlock}
import conf.Configuration
import model.dotcomrendering.pageElements.PageElement
import model.{ContentFormat, ContentPage}
import play.api.libs.json._
import play.api.mvc.RequestHeader

// -----------------------------------------------------------------
// DCR KeyEvents DataModel
// -----------------------------------------------------------------

case class DotcomKeyEventsRenderingDataModel(
    keyEvents: List[Block],
    format: ContentFormat,
    filterKeyEvents: Boolean,
)

object DotcomKeyEventsRenderingDataModel {

  implicit val pageElementWrites = PageElement.pageElementWrites

  implicit val writes = new Writes[DotcomKeyEventsRenderingDataModel] {
    def writes(model: DotcomKeyEventsRenderingDataModel) = {
      val obj = Json.obj(
        "keyEvents" -> model.keyEvents,
        "format" -> model.format,
        "filterKeyEvents" -> model.filterKeyEvents,
      )
      ElementsEnhancer.enhanceKeyEvents(obj)
    }
  }

  def toJson(model: DotcomKeyEventsRenderingDataModel): String = {
    val jsValue = Json.toJson(model)
    Json.stringify(DotcomRenderingUtils.withoutNull(jsValue))
  }

  def apply(
      page: ContentPage,
      request: RequestHeader,
      keyEvents: Seq[APIBlock],
      filterKeyEvents: Boolean,
  ): DotcomKeyEventsRenderingDataModel = {
    val content = page.item
    val shouldAddAffiliateLinks = DotcomRenderingUtils.shouldAddAffiliateLinks(content)
    val contentDateTimes = DotcomRenderingUtils.contentDateTimes(content)

    val calloutsUrl = Option(Configuration.journalism.calloutsUrl);

    val bodyBlocksDCR: List[Block] = keyEvents
      .filter(_.published)
      .map(block =>
        Block(block, page, shouldAddAffiliateLinks, request, isMainBlock = false, calloutsUrl, contentDateTimes),
      )
      .toList

    DotcomKeyEventsRenderingDataModel(
      keyEvents = bodyBlocksDCR,
      format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      filterKeyEvents = filterKeyEvents,
    )
  }
}
