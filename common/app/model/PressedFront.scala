package model.facia

import com.gu.contentapi.client.model._
import com.gu.facia.api.models._
import com.gu.facia.api.models.{Collection, CuratedContent}
import com.gu.facia.api.utils._
import com.gu.facia.client.models.Trail
import model.{FrontProperties, SeoData}
import org.joda.time.DateTime
import play.api.libs.json._

object FapiJsonFormats {
  implicit val frontImageFormat = Json.format[FrontImage]
  implicit object frontPriorityFormat extends Format[FrontPriority] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("EditorialPriority"), _) => JsSuccess(EditorialPriority)
      case JsSuccess(JsString("CommercialPriority"), _) => JsSuccess(CommercialPriority)
      case JsSuccess(JsString("TrainingPriority"), _) => JsSuccess(TrainingPriority)
      case _ => JsError("Could not convert FrontPriority")
    }

    def writes(frontPriority: FrontPriority) = frontPriority match {
      case EditorialPriority => JsObject(Seq("type" -> JsString("EditorialPriority")))
      case CommercialPriority => JsObject(Seq("type" -> JsString("CommercialPriority")))
      case TrainingPriority => JsObject(Seq("type" -> JsString("TrainingPriority")))
    }
  }

  implicit val frontFormat = Json.format[Front]

  implicit val trailFormat = Json.format[Trail]
  implicit val groupFormat = Json.format[Group]
  implicit val newCollectionFormat = Json.format[Collection]

  implicit val podcastFormat = Json.format[Podcast]
  implicit val referenceFormat = Json.format[Reference]
  implicit val tagFormat = Json.format[Tag]
  implicit val assetFormat = Json.format[Asset]
  implicit val elementFormat = Json.format[Element]
  implicit val contentFormat = Json.format[Content]

  implicit val seriesFormat = Json.format[Series]
  val podcastKickerFormat = Json.format[PodcastKicker]
  val tagKickerFormat = Json.format[TagKicker]
  val sectionKickerFormat = Json.format[SectionKicker]
  val freeHtmlKickerFormat = Json.format[FreeHtmlKicker]
  val freeHtmlKickerWithLinkFormat = Json.format[FreeHtmlKickerWithLink]


  implicit object itemKickerFormat extends Format[ItemKicker] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("BreakingNewsKicker"), _) => JsSuccess(BreakingNewsKicker)
        case JsSuccess(JsString("LiveKicker"), _) => JsSuccess(LiveKicker)
        case JsSuccess(JsString("AnalysisKicker"), _) => JsSuccess(AnalysisKicker)
        case JsSuccess(JsString("ReviewKicker"), _) => JsSuccess(ReviewKicker)
        case JsSuccess(JsString("CartoonKicker"), _) => JsSuccess(CartoonKicker)
        case JsSuccess(JsString("PodcastKicker"), _) =>  (json \ "item").validate[PodcastKicker](podcastKickerFormat)
        case JsSuccess(JsString("TagKicker"), _) => (json \ "item").validate[TagKicker](tagKickerFormat)
        case JsSuccess(JsString("SectionKicker"), _) => (json \ "item").validate[TagKicker](tagKickerFormat)
        case JsSuccess(JsString("FreeHtmlKicker"), _) => (json \ "item").validate[TagKicker](tagKickerFormat)
        case JsSuccess(JsString("FreeHtmlKickerWithLink"), _) => (json \ "item").validate[TagKicker](tagKickerFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(itemKicker: ItemKicker) = itemKicker match {
      case BreakingNewsKicker => JsObject(Seq("type" -> JsString("BreakingNewsKicker")))
      case LiveKicker => JsObject(Seq("type" -> JsString("LiveKicker")))
      case AnalysisKicker => JsObject(Seq("type" -> JsString("AnalysisKicker")))
      case ReviewKicker => JsObject(Seq("type" -> JsString("ReviewKicker")))
      case CartoonKicker => JsObject(Seq("type" -> JsString("CartoonKicker")))
      case PodcastKicker(series) => JsObject(Seq("type" -> JsString("PodcastKicker"), "series" -> Json.toJson(series)))
      case tagKicker: TagKicker => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(tagKicker)(tagKickerFormat)))
      case sectionKicker: SectionKicker => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(sectionKicker)(sectionKickerFormat)))
      case freeHtmlKicker: FreeHtmlKicker => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(freeHtmlKicker)(freeHtmlKickerFormat)))
      case freeHtmlKickerWithLink: FreeHtmlKickerWithLink => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(freeHtmlKickerWithLink)(freeHtmlKickerWithLinkFormat)))
    }
  }

  implicit val imageCutoutFormat = Json.format[ImageCutout]
  implicit val imageFormat = Json.format[Image]

  implicit val latestSnapFormat = Json.format[LatestSnap]
  implicit val linkSnapFormat = Json.format[LinkSnap]

  implicit object faciaContentFormat extends Format[FaciaContent] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("LinkSnap"), _) => JsSuccess(json.as[LinkSnap])
      case JsSuccess(JsString("LatestSnap"), _) => JsSuccess(json.as[LatestSnap])
      case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent])
      case JsSuccess(JsString("SupportingCuratedContent"), _) => JsSuccess(json.as[SupportingCuratedContent])
      case _ => JsError("Could not convert FaciaContent")
    }

    def writes(faciaContent: FaciaContent) = faciaContent match {
      case linkSnap: LinkSnap => Json.toJson(linkSnap)(linkSnapFormat)
      case latestSnap: LatestSnap => Json.toJson(latestSnap)(latestSnapFormat)
      case content: CuratedContent => Json.toJson(content)(curatedContentFormat)
      case supportingContent: SupportingCuratedContent => Json.toJson(supportingContent)(supportingCuratedContentFormat)
      case _ => JsNull
    }
  }

  implicit val curatedContentFormat = Json.format[CuratedContent]
  implicit val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]
}

case class PressedCollection(
  id: String,
  displayName: String,
  curated: List[FaciaContent],
  backfill: List[FaciaContent],
  lastUpdated: Option[DateTime],
  updatedBy: Option[String],
  updatedEmail: Option[String],
  href: Option[String],
  apiQuery: Option[String],
  collectionType: String,
  groups: Option[List[Group]],
  uneditable: Boolean,
  showTags: Boolean,
  showSections: Boolean,
  hideKickers: Boolean,
  showDateHeader: Boolean,
  showLatestUpdate: Boolean)

object PressedCollection {
  import FapiJsonFormats._
  implicit val pressedCollectionFormat = Json.format[PressedCollection]

  def fromCollectionWithCuratedAndBackfill(
      collection: com.gu.facia.api.models.Collection,
      curated: List[FaciaContent],
      backfill: List[FaciaContent]): PressedCollection =
    PressedCollection(
      collection.id,
      collection.displayName,
      curated,
      backfill,
      collection.lastUpdated,
      collection.updatedBy,
      collection.updatedEmail,
      collection.href,
      collection.apiQuery,
      collection.collectionType,
      collection.groups,
      collection.uneditable,
      collection.showTags,
      collection.showSections,
      collection.hideKickers,
      collection.showDateHeader,
      collection.showLatestUpdate)
}

case class PressedFront(
  path: String,
  seoData: SeoData,
  frontProperties: FrontProperties,
  collections: List[PressedCollection])

object PressedFront {
  import FapiJsonFormats._
  implicit val pressedFrontFormat = Json.format[PressedFront]
}
