package views.support

import com.gu.facia.client.models.{SupportingItemMetaData, TrailMetaData}
import model.{CollectionItems, Collection, Content}
import play.api.libs.json.{JsBoolean, JsString}

trait FirstTwoBigItems extends CollectionItems {
  override lazy val items: Seq[Content] = {
    super.items match {
      case x :: y :: tail =>
        Content(x.apiContent.copy(metaData = x.apiContent.metaData.map {
          case t: TrailMetaData => t.copy(json = t.json + ("group" -> JsString("1"), "isBoosted" -> JsBoolean(true)))
          case t: SupportingItemMetaData => t.copy(json = t.json + ("group" -> JsString("1"), "isBoosted" -> JsBoolean(true)))
        })) ::
        Content(y.apiContent.copy(metaData = y.apiContent.metaData.map {
          case t: TrailMetaData => t.copy(json = t.json + ("group" -> JsString("1")))
          case t: SupportingItemMetaData => t.copy(json = t.json + ("group" -> JsString("1")))
        })) ::
        tail
      case x => x.map{ content =>
        Content(content.apiContent.copy(metaData = content.apiContent.metaData.map {
          case t: TrailMetaData => t.copy(json = t.json + ("group" -> JsString("1"), "isBoosted" -> JsBoolean(true)))
          case t: SupportingItemMetaData => t.copy(json = t.json + ("group" -> JsString("1"), "isBoosted" -> JsBoolean(true)))
        }))
      }
    }
  }
}

object ForceGroupsCollection {
  def firstTwoBig(c: Collection): Collection = {
    new Collection(c.curated, c.editorsPicks, c.mostViewed, c.results, c.displayName, c.href,
      c.lastUpdated, c.updatedBy, c.updatedEmail) with FirstTwoBigItems
  }
}