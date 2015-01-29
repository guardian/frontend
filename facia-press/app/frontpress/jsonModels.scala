package frontpress

import com.gu.facia.client.models.{CollectionConfigJson => CollectionConfig}
import com.gu.contentapi.client.model.Asset
import model._
import org.joda.time.DateTime
import play.api.libs.json._
import com.gu.contentapi.client.model.{Element => ApiElement}
import views.support.Naked

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
  private def flattenedJsObject(xs: (String, Option[JsValue])*) = JsObject(xs collect {
    case (k, Some(v)) => k -> v
  })

  def fromContent(content: Content): JsObject = flattenedJsObject(
    ("headline", content.apiContent.metaData.flatMap(_.headline).map(JsString)),
    ("trailText", content.apiContent.metaData.flatMap(_.trailText).map(JsString)),
    ("byline", content.apiContent.metaData.flatMap(_.byline).map(JsString)),
    ("showByline", content.apiContent.metaData.flatMap(_.showByline).map(JsBoolean)),
    ("group", content.apiContent.metaData.flatMap(_.group).map(JsString)),
    ("isBoosted", content.apiContent.metaData.flatMap(_.isBoosted).map(JsBoolean)),
    ("imageHide", content.apiContent.metaData.flatMap(_.imageHide).map(JsBoolean)),
    ("imageCutoutReplace", content.apiContent.metaData.flatMap(_.imageCutoutReplace).map(JsBoolean)),
    ("imageCutoutSrc", content.apiContent.metaData.flatMap(_.imageCutoutSrc).map(JsString)),
    ("imageCutoutSrcWidth", content.apiContent.metaData.flatMap(_.imageCutoutSrcWidth).map(JsString)),
    ("imageCutoutSrcHeight", content.apiContent.metaData.flatMap(_.imageCutoutSrcHeight).map(JsString)),
    ("isBreaking", content.apiContent.metaData.flatMap(_.isBreaking).map(JsBoolean)),
    ("supporting", Option(content.supporting.map(item => Json.toJson(TrailJson.fromContent(item))))
      .filter(_.nonEmpty)
      .map(JsArray.apply)),
    ("href", content.apiContent.metaData.flatMap(_.href).map(JsString)),
    ("snapType", content.apiContent.metaData.flatMap(_.snapType).map(JsString)),
    ("snapCss", content.apiContent.metaData.flatMap(_.snapCss).map(JsString)),
    ("snapUri", content.apiContent.metaData.flatMap(_.snapUri).map(JsString)),
    ("showKickerTag", content.apiContent.metaData.flatMap(_.showKickerTag).map(JsBoolean)),
    ("showKickerSection", content.apiContent.metaData.flatMap(_.showKickerSection).map(JsBoolean)),
    ("showKickerCustom", content.apiContent.metaData.flatMap(_.showKickerCustom).map(JsBoolean)),
    ("customKicker", content.apiContent.metaData.flatMap(_.customKicker).map(JsString)),
    ("showBoostedHeadline", content.apiContent.metaData.flatMap(_.showBoostedHeadline).map(JsBoolean)),
    ("showQuotedHeadline", content.apiContent.metaData.flatMap(_.showQuotedHeadline).map(JsBoolean)),
    ("showMainVideo", content.apiContent.metaData.flatMap(_.showMainVideo).map(JsBoolean))
  )
}

case class ItemMeta(
  headline:      Option[JsValue],
  trailText:     Option[JsValue],
  byline:        Option[JsValue],
  showByline:    Option[Boolean],
  group:         Option[JsValue],
  isBoosted:     Option[Boolean],
  imageHide:     Option[Boolean],
  imageCutoutReplace:   Option[Boolean],
  imageCutoutSrc:       Option[JsValue],
  imageCutoutSrcWidth:  Option[JsValue],
  imageCutoutSrcHeight: Option[JsValue],
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
      content.byline,
      content.delegate.safeFields,
      apiElementsToElements(slimElements(content)).map(ElementJson.fromElement),
      ItemMeta.fromContent(content)
    )
  }

  def slimElements(content: Content): List[ApiElement] = content.trailPictureAll(5, 3).map {
    imageContainer =>
      imageContainer.delegate.copy(assets =
        Naked.elementFor(imageContainer).map(_.delegate).toList)} ++
    content.mainVideo.map(_.delegate)


  def apiElementsToElements(apiElements: List[ApiElement]): List[Element] =
    apiElements.zipWithIndex.map{case (element, index) => Element(element, index)}
}

case class TrailJson(
  webPublicationDate: DateTime,
  sectionName: String,
  sectionId: String,
  id: String,
  webUrl: String,
  tags: Seq[TagJson],
  trailText: Option[String],
  byline: Option[String],
  safeFields: Map[String, String],
  elements: Seq[ElementJson],
  meta: JsObject
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
      treats         = collection.treats.map(TrailJson.fromContent),
      lastUpdated    = collection.lastUpdated,
      updatedBy      = collection.updatedBy,
      updatedEmail   = collection.updatedEmail,
      groups         = config.groups.filter(_.nonEmpty),
      href           = collection.href.orElse(config.href),
      `type`         = config.collectionType,
      showTags       = config.showTags.getOrElse(false),
      showSections   = config.showSections.getOrElse(false),
      hideKickers    = config.hideKickers.getOrElse(false),
      showDateHeader = config.showDateHeader.getOrElse(false),
      showLatestUpdate = config.showLatestUpdate.getOrElse(false),
      excludeFromRss = config.excludeFromRss.getOrElse(false)
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
  treats:       Seq[TrailJson],
  lastUpdated:  Option[String],
  updatedBy:    Option[String],
  updatedEmail: Option[String],
  groups:       Option[Seq[String]],
  href:         Option[String],
  showTags:     Boolean,
  showSections: Boolean,
  hideKickers:  Boolean,
  showDateHeader: Boolean,
  showLatestUpdate: Boolean,
  excludeFromRss: Boolean
)
