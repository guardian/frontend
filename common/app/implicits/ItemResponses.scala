package implicits

import com.gu.openplatform.contentapi.model.ItemResponse


trait ItemResponses {
  implicit class ItemResponse2isType(i: ItemResponse) {
    lazy val isTag = i.tag.isDefined
    lazy val isSection = i.section.isDefined
  }
}
