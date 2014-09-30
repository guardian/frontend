package frontpress

import com.gu.facia.client.models.CollectionConfig
import com.gu.openplatform.contentapi.model.Asset
import conf.Switches
import model._
import org.joda.time.DateTime
import play.api.libs.json._

object ElementJson {
  implicit val assetFormat = Json.format[Asset]

  implicit val jsonFormat = Json.format[ElementJson]

  def fromElement(element: Element) =
    ElementJson(
      element.id,
      element.delegate.relation,
      element.delegate.`type`,
      element.delegate.assets
    )
}

case class ElementJson(
  id: String,
  relation: String,
  `type`: String,
  assets: List[Asset]
)

object TagJson {
  implicit val jsonFormat = Json.format[TagJson]

  def fromTag(tag: Tag) = TagJson(
    tag.id,
    tag.tagType,
    tag.webTitle,
    tag.webUrl,
    tag.section,
    tag.contributorImagePath,
    tag.contributorLargeImagePath
  )
}

case class TagJson(
  id: String,
  `type`: String,
  webTitle: String,
  webUrl: String,
  section: String,
  bylineImageUrl: Option[String],
  bylineLargeImageUrl: Option[String]
)

object ItemMeta {
  implicit lazy val jsonFormat = Json.format[ItemMeta]

  def fromContent(content: Content): ItemMeta = ItemMeta(
    headline = content.apiContent.metaData.flatMap(_.headline).map(JsString),
    trailText = content.apiContent.metaData.flatMap(_.trailText).map(JsString),
    group = content.apiContent.metaData.flatMap(_.group).map(JsString),
    isBoosted = content.apiContent.metaData.flatMap(_.isBoosted),
    imageHide = content.apiContent.metaData.flatMap(_.imageHide),
    isBreaking = content.apiContent.metaData.flatMap(_.isBreaking),
    supporting = Option(content.supporting.map(item => Json.toJson(TrailJson.fromContent(item)))).filter(_.nonEmpty),
    href = content.apiContent.metaData.flatMap(_.href).map(JsString),
    snapType = content.apiContent.metaData.flatMap(_.snapType).map(JsString),
    snapCss = content.apiContent.metaData.flatMap(_.snapCss).map(JsString),
    snapUri = content.apiContent.metaData.flatMap(_.snapUri).map(JsString),
    showKickerTag = content.apiContent.metaData.flatMap(_.showKickerTag).map(JsBoolean),
    showKickerSection = content.apiContent.metaData.flatMap(_.showKickerSection).map(JsBoolean),
    showMainVideo = content.apiContent.metaData.flatMap(_.showMainVideo).map(JsBoolean)
  )
}

case class ItemMeta(
  headline:      Option[JsValue],
  trailText:     Option[JsValue],
  group:         Option[JsValue],
  isBoosted:     Option[Boolean],
  imageHide:     Option[Boolean],
  isBreaking:    Option[Boolean],
  supporting:    Option[Seq[JsValue]],
  href:          Option[JsValue],
  snapType:      Option[JsValue],
  snapCss:       Option[JsValue],
  snapUri:       Option[JsValue],
  showKickerTag: Option[JsValue],
  showKickerSection: Option[JsValue],
  showMainVideo: Option[JsValue]
)


object TrailJson {
  implicit val jsonFormat = Json.format[TrailJson]

  def fromContent(content: Content) = {
    TrailJson(
      content.webPublicationDate,
      content.sectionName,
      content.section,
      content.id,
      content.webUrl,
      content.tags.map(TagJson.fromTag),
      content.trailText,
      content.delegate.safeFields,
      content.elements.map(ElementJson.fromElement),
      ItemMeta.fromContent(content)
    )
  }
}

case class TrailJson(
  webPublicationDate: DateTime,
  sectionName: String,
  sectionId: String,
  id: String,
  webUrl: String,
  tags: Seq[TagJson],
  trailText: Option[String],
  safeFields: Map[String, String],
  elements: Seq[ElementJson],
  meta: ItemMeta
)

object CollectionJson {
  implicit val jsonFormat = Json.format[CollectionJson]

  def fromCollection(config: CollectionConfig, collection: Collection) =
    CollectionJson(
      apiQuery       = config.apiQuery,
      displayName    = config.displayName.orElse(collection.displayName),
      curated        = collection.curated.map(TrailJson.fromContent),
      editorsPicks   = collection.editorsPicks.map(TrailJson.fromContent),
      mostViewed     = collection.mostViewed.map(TrailJson.fromContent),
      results        = collection.results.map(TrailJson.fromContent),
      lastUpdated    = collection.lastUpdated,
      updatedBy      = collection.updatedBy,
      updatedEmail   = collection.updatedEmail,
      groups         = config.groups.filter(_.nonEmpty),
      href           = collection.href.orElse(config.href),
      `type`         = config.`type`,
      showTags       = config.showTags.getOrElse(false),
      showSections   = config.showSections.getOrElse(false)
    )
}

case class CollectionJson(
  apiQuery:     Option[String],
  displayName:  Option[String],
  `type`:       Option[String],
  curated:      Seq[TrailJson],
  editorsPicks: Seq[TrailJson],
  mostViewed:   Seq[TrailJson],
  results:      Seq[TrailJson],
  lastUpdated:  Option[String],
  updatedBy:    Option[String],
  updatedEmail: Option[String],
  groups:       Option[Seq[String]],
  href:         Option[String],
  showTags:     Boolean,
  showSections: Boolean
)
