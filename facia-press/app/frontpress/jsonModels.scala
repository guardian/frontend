package frontpress

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
    tag.contributorImagePath
  )
}

case class TagJson(
  id: String,
  `type`: String,
  webTitle: String,
  webUrl: String,
  section: String,
  bylineImageUrl: Option[String]
)

object ItemMeta {
  implicit lazy val jsonFormat = Json.format[ItemMeta]

  def fromContent(content: Content): ItemMeta = ItemMeta(
    headline = content.apiContent.metaData.get("headline"),
    trailText = content.apiContent.metaData.get("trailText"),
    group = content.apiContent.metaData.get("group"),
    imageAdjust = content.apiContent.metaData.get("imageAdjust"),
    kicker = content.apiContent.metaData.get("kicker"),
    supporting = Option(content.supporting.map(item => Json.toJson(TrailJson.fromContent(item)))).filter(_.nonEmpty),
    href = content.apiContent.metaData.get("href"),
    snapType = content.apiContent.metaData.get("snapType"),
    snapCss = content.apiContent.metaData.get("snapCss"),
    snapUri = content.apiContent.metaData.get("snapUri"),
    showMainVideo = content.apiContent.metaData.get("showMainVideo")
  )
}

case class ItemMeta(
  headline:      Option[JsValue],
  trailText:     Option[JsValue],
  group:         Option[JsValue],
  imageAdjust:   Option[JsValue],
  kicker:        Option[JsValue],
  supporting:    Option[Seq[JsValue]],
  href:          Option[JsValue],
  snapType:      Option[JsValue],
  snapCss:       Option[JsValue],
  snapUri:       Option[JsValue],
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

  def fromCollection(config: Config, collection: Collection) =
    CollectionJson(
      apiQuery       = config.contentApiQuery,
      displayName    = config.displayName.orElse(collection.displayName),
      curated        = collection.curated.map(TrailJson.fromContent),
      editorsPicks   = collection.editorsPicks.map(TrailJson.fromContent),
      mostViewed     = collection.mostViewed.map(TrailJson.fromContent),
      results        = collection.results.map(TrailJson.fromContent),
      lastUpdated    = collection.lastUpdated,
      updatedBy      = collection.updatedBy,
      updatedEmail   = collection.updatedEmail,
      groups         = Option(config.groups).filter(_.nonEmpty),
      href           = collection.href.orElse(config.href),
      `type`         = config.collectionType,
      showTags       = Switches.FaciaToolContainerTagsSwitch.isSwitchedOn && config.showTags,
      showSections   = Switches.FaciaToolContainerTagsSwitch.isSwitchedOn && config.showSections
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
