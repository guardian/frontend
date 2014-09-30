package views.support

import model.{CollectionItems, Collection, Content}
import play.api.libs.json.{JsValue, JsString, JsBoolean}

trait FirstTwoBigItems extends CollectionItems {
  private def setMetaFields(c: Content, fields: Map[String, JsValue]): Content = {
    Content(apiContent = c.apiContent.copy(metaData = c.apiContent.metaData ++ fields))
  }

  override lazy val items: Seq[Content] = {
    super.items match {
      case x :: y :: tail =>
        setMetaFields(x, Map("group" -> JsString("1"), "isBoosted" -> JsBoolean(true))) ::
          setMetaFields(y, Map("group" -> JsString("1"))) :: tail
      case x => x.map(setMetaFields(_, Map("group" -> JsString("1"), "isBoosted" -> JsBoolean(true))))
    }
  }
}

object ForceGroupsCollection {
  def firstTwoBig(c: Collection): Collection = {
    new Collection(c.curated, c.editorsPicks, c.mostViewed, c.results, c.displayName, c.href,
      c.lastUpdated, c.updatedBy, c.updatedEmail) with FirstTwoBigItems
  }
}