package implicits

import com.gu.openplatform.contentapi.model.ItemResponse


trait ItemResponses {
  implicit class ItemResponse2isType(i: ItemResponse) {
    lazy val isTag = i.tag.isDefined
    lazy val isSection = i.section.isDefined

    lazy val webUrl = i.content.map(_.webUrl).orElse(i.section.map(_.webUrl)).orElse(i.tag.map(_.webUrl))
  }
}
