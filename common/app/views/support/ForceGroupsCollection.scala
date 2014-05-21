package views.support

import model.{CollectionItems, Collection, Content}
import play.api.libs.json.JsString

trait FirstTwoBigItems extends CollectionItems {
  override lazy val items: Seq[Content] = {
    def setMetaFields(c: Content, fields: Map[String, String]): Content = {
      Content(apiContent = c.apiContent.copy(metaData = c.apiContent.metaData ++ fields.map {
        case (k, v) => k -> JsString(v)
      }))
    }

    super.items match {
      case x :: y :: tail =>
        setMetaFields(x, Map("group" -> "1", "imageAdjust" -> "boost")) ::
          setMetaFields(y, Map("group" -> "1")) :: tail
      case x :: Nil => List(setMetaFields(x, Map("group" -> "1", "imageAdjust" -> "boost")))
    }
  }
}

object ForceGroupsCollection {
  def firstTwoBig(c: Collection): Collection = {
    new Collection(c.curated, c.editorsPicks, c.mostViewed, c.results, c.displayName, c.href,
      c.lastUpdated, c.updatedBy, c.updatedEmail) with FirstTwoBigItems
  }
}