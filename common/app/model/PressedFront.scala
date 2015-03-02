package model.facia

import com.gu.contentapi.client.model._
import com.gu.facia.api.models.CuratedContent
import com.gu.facia.api.models._
import com.gu.facia.api.utils._
import model.{SeoData, FrontProperties}
import org.joda.time.DateTime
import play.api.libs.json._
import services.CollectionConfigWithId

object FapiJsonFormats {
  /* Content API Formats */
  implicit val contentApiReferenceFormat = Json.format[com.gu.contentapi.client.model.Reference]
  implicit val contentApiPodcastFormat = Json.format[com.gu.contentapi.client.model.Podcast]
  implicit val contentApiTagFormat = Json.format[com.gu.contentapi.client.model.Tag]
  implicit val contentApiAssetFormat = Json.format[com.gu.contentapi.client.model.Asset]
  implicit val contentApiElementFormat = Json.format[com.gu.contentapi.client.model.Element]
  implicit val contentApiContentFormat = Json.format[com.gu.contentapi.client.model.Content]

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

  implicit val groupFormat = Json.format[Group]

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
        case JsSuccess(JsString("SectionKicker"), _) => (json \ "item").validate[SectionKicker](sectionKickerFormat)
        case JsSuccess(JsString("FreeHtmlKicker"), _) => (json \ "item").validate[FreeHtmlKicker](freeHtmlKickerFormat)
        case JsSuccess(JsString("FreeHtmlKickerWithLink"), _) => (json \ "item").validate[FreeHtmlKickerWithLink](freeHtmlKickerWithLinkFormat)
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
      case sectionKicker: SectionKicker => JsObject(Seq("type" -> JsString("SectionKicker"), "item" -> Json.toJson(sectionKicker)(sectionKickerFormat)))
      case freeHtmlKicker: FreeHtmlKicker => JsObject(Seq("type" -> JsString("FreeHtmlKicker"), "item" -> Json.toJson(freeHtmlKicker)(freeHtmlKickerFormat)))
      case freeHtmlKickerWithLink: FreeHtmlKickerWithLink => JsObject(Seq("type" -> JsString("FreeHtmlKickerWithLink"), "item" -> Json.toJson(freeHtmlKickerWithLink)(freeHtmlKickerWithLinkFormat)))
    }
  }

  implicit val imageCutoutFormat = Json.format[ImageCutout]
  implicit val imageFormat = Json.format[ImageReplace]

  implicit val latestSnapFormat = Json.format[LatestSnap]
  implicit val linkSnapFormat = Json.format[LinkSnap]

  implicit object faciaContentFormat extends Format[FaciaContent] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("LinkSnap"), _) => JsSuccess(json.as[LinkSnap])
      case JsSuccess(JsString("LatestSnap"), _) => JsSuccess(json.as[LatestSnap])
      case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent](curatedContentFormat))
      case JsSuccess(JsString("SupportingCuratedContent"), _) => JsSuccess(json.as[SupportingCuratedContent](supportingCuratedContentFormat))
      case _ => JsError("Could not convert FaciaContent")
    }

    def writes(faciaContent: FaciaContent) = faciaContent match {
      case linkSnap: LinkSnap => Json.toJson(linkSnap)(linkSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) => l ++ Json.obj("type" -> "LinkSnap")
        case JsError(_) => JsNull
      }
      case latestSnap: LatestSnap => Json.toJson(latestSnap)(latestSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) => l ++ Json.obj("type" -> "LatestSnap")
        case JsError(_) => JsNull
      }
      case content: CuratedContent => Json.toJson(content)(curatedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) => l ++ Json.obj("type" -> "CuratedContent")
        case JsError(_) => JsNull
      }
      case supportingContent: SupportingCuratedContent => Json.toJson(supportingContent)(supportingCuratedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) => l ++ Json.obj("type" -> "SupportingCuratedContent")
        case JsError(_) => JsNull
      }
      case _ => JsNull
    }
  }

  implicit val curatedContentFormat = Json.format[CuratedContent]
  implicit val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]

  implicit object importanceFormat extends Format[Importance] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("CriticalImportance"), _) => JsSuccess(Critical)
      case JsSuccess(JsString("ImportanceImportance"), _) => JsSuccess(Important)
      case JsSuccess(JsString("DefaultImportance"), _) => JsSuccess(DefaultImportance)
      case _ => JsError("Could not convert Importance")
    }

    def writes(importance: Importance) = importance match {
      case Critical => JsObject(Seq("type" -> JsString("CriticalImportance")))
      case Important => JsObject(Seq("type" -> JsString("ImportanceImportance")))
      case DefaultImportance => JsObject(Seq("type" -> JsString("DefaultImportance")))
    }
  }

  implicit val groupsFormat = Json.format[Groups]
  implicit val collectionConfigFormat = Json.format[CollectionConfig]
}

case class PressedCollection(
  id: String,
  displayName: String,
  curated: List[FaciaContent],
  backfill: List[FaciaContent],
  treats: List[FaciaContent],
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
  showLatestUpdate: Boolean,
  config: CollectionConfig) {

  lazy val collectionConfigWithId = CollectionConfigWithId(id, config)

  lazy val all = curated ++ backfill
}

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
      Nil,
      collection.lastUpdated,
      collection.updatedBy,
      collection.updatedEmail,
      collection.href,
      collection.collectionConfig.apiQuery,
      collection.collectionConfig.collectionType,
      collection.collectionConfig.groups.map(Group.fromGroups),
      collection.collectionConfig.uneditable,
      collection.collectionConfig.showTags,
      collection.collectionConfig.showSections,
      collection.collectionConfig.hideKickers,
      collection.collectionConfig.showDateHeader,
      collection.collectionConfig.showLatestUpdate,
      collection.collectionConfig)
}
