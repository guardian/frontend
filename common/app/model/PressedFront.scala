package model.facia


import com.gu.facia.api.models.{CuratedContent, _}
import com.gu.facia.api.utils._
import implicits.CollectionsOps._
import org.joda.time.DateTime
import play.api.libs.json._
import services.CollectionConfigWithId
import com.gu.contentapi.client.model._
import implicits.FaciaContentImplicits._

object FapiJsonFormats {
  /* Content API Formats */
  implicit val contentApiReferenceFormat = Json.format[Reference]
  implicit val contentApiPodcastFormat = Json.format[Podcast]
  implicit val contentApiTagFormat = Json.format[Tag]
  implicit val contentApiAssetFormat = Json.format[Asset]
  implicit val contentApiElementFormat = Json.format[Element]
  implicit val contentApiUserFormat = Json.format[User]
  implicit val contentApiAssetTypeDataFormat = Json.format[AssetTypeData]
  implicit val contentApiVideoTypeDataFormat = Json.format[VideoTypeData]
  implicit val contentApiTweetTypeDataFormat = Json.format[TweetTypeData]
  implicit val contentApiImageTypeDataFormat = Json.format[ImageTypeData]
  implicit val contentApiAudioTypeDataFormat = Json.format[AudioTypeData]
  implicit val contentApiPullquoteTypeDataFormat = Json.format[PullquoteTypeData]
  implicit val contentApiTextTypeDataFormat = Json.format[TextTypeData]
  implicit val contentApiBlockAssetFormat = Json.format[BlockAsset]
  implicit val contentApiBlockElementFormat = Json.format[BlockElement]
  implicit val contentApiBlockFormat = Json.format[Block]
  implicit val contentApiBlocksFormat = Json.format[Blocks]
  implicit val contentApiRightsFormat = Json.format[Rights]
  implicit val contentApiCrosswordDimensionsFormat = Json.format[CrosswordDimensions]
  implicit val contentApiCrosswordPositionFormat = Json.format[CrosswordPosition]
  implicit val contentApiCrosswordEntryFormat = Json.format[CrosswordEntry]
  implicit val contentApiCrosswordCreatorFormat = Json.format[CrosswordCreator]
  implicit val contentApiCrosswordFormat = Json.format[Crossword]
  implicit val contentApiContentFormat = Json.format[Content]

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
        case JsSuccess(JsString("PodcastKicker"), _) =>  (json \ "series").validate[PodcastKicker](podcastKickerFormat)
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

  implicit object CardStyleFormat extends Format[CardStyle] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("SpecialReport"), _) => JsSuccess(SpecialReport)
        case JsSuccess(JsString("LiveBlog"), _) => JsSuccess(LiveBlog)
        case JsSuccess(JsString("DeadBlog"), _) => JsSuccess(DeadBlog)
        case JsSuccess(JsString("Feature"), _) => JsSuccess(Feature)
        case JsSuccess(JsString("Editorial"), _) => JsSuccess(Editorial)
        case JsSuccess(JsString("Comment"), _) =>  JsSuccess(Comment)
        case JsSuccess(JsString("Media"), _) => JsSuccess(Media)
        case JsSuccess(JsString("Analysis"), _) => JsSuccess(Analysis)
        case JsSuccess(JsString("Review"), _) => JsSuccess(Review)
        case JsSuccess(JsString("Letters"), _) => JsSuccess(Letters)
        case JsSuccess(JsString("ExternalLink"), _) => JsSuccess(ExternalLink)
        case JsSuccess(JsString("DefaultCardstyle"), _) => JsSuccess(DefaultCardstyle)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(cardStyle: com.gu.facia.api.utils.CardStyle) = cardStyle match {
      case SpecialReport => JsObject(Seq("type" -> JsString("SpecialReport")))
      case LiveBlog => JsObject(Seq("type" -> JsString("LiveBlog")))
      case DeadBlog => JsObject(Seq("type" -> JsString("DeadBlog")))
      case Feature => JsObject(Seq("type" -> JsString("Feature")))
      case Editorial => JsObject(Seq("type" -> JsString("Editorial")))
      case Comment => JsObject(Seq("type" -> JsString("Comment")))
      case Media => JsObject(Seq("type" -> JsString("Media")))
      case Analysis => JsObject(Seq("type" -> JsString("Analysis")))
      case Review => JsObject(Seq("type" -> JsString("Review")))
      case Letters => JsObject(Seq("type" -> JsString("Letters")))
      case ExternalLink => JsObject(Seq("type" -> JsString("ExternalLink")))
      case DefaultCardstyle => JsObject(Seq("type" -> JsString("DefaultCardstyle")))
    }
  }

  implicit val cutoutFormat = Json.format[Cutout]
  implicit val replaceFormat = Json.format[Replace]
  implicit val slideshowFormat = Json.format[ImageSlideshow]

  implicit object faciaImageFormat extends Format[FaciaImage] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Cutout"), _) => (json \ "item").validate[Cutout](cutoutFormat)
        case JsSuccess(JsString("Replace"), _) => (json \ "item").validate[Replace](replaceFormat)
        case JsSuccess(JsString("ImageSlideshow"), _) => (json \ "item").validate[ImageSlideshow](slideshowFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(faciaImage: FaciaImage) = faciaImage match {
      case cutout: Cutout => JsObject(Seq("type" -> JsString("Cutout"), "item" -> Json.toJson(cutout)(cutoutFormat)))
      case replace: Replace => JsObject(Seq("type" -> JsString("Replace"), "item" -> Json.toJson(replace)(replaceFormat)))
      case imageSlideshow: ImageSlideshow => JsObject(Seq("type" -> JsString("ImageSlideshow"), "item" -> Json.toJson(imageSlideshow)(slideshowFormat)))
    }
  }


  implicit val contentPropertiesFormat = Json.format[ContentProperties]

  implicit object faciaContentFormat extends Format[FaciaContent] {
    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("LinkSnap"), _) => JsSuccess(json.as[LinkSnap](linkSnapFormat))
      case JsSuccess(JsString("LatestSnap"), _) => JsSuccess(json.as[LatestSnap](latestSnapFormat))
      case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent](curatedContentFormat))
      case JsSuccess(JsString("SupportingCuratedContent"), _) => JsSuccess(json.as[SupportingCuratedContent](supportingCuratedContentFormat))
      case _ => JsError("Could not convert FaciaContent")
    }

    def writes(faciaContent: FaciaContent) = faciaContent match {
      case linkSnap: LinkSnap => Json.toJson(linkSnap)(linkSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LinkSnap")
        case JsError(_) => JsNull
      }
      case latestSnap: LatestSnap => Json.toJson(latestSnap)(latestSnapFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LatestSnap")
        case JsError(_) => JsNull
      }
      case content: CuratedContent => Json.toJson(content)(curatedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "CuratedContent")
        case JsError(_) => JsNull
      }
      case supportingContent: SupportingCuratedContent => Json.toJson(supportingContent)(supportingCuratedContentFormat).transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "SupportingCuratedContent")
        case JsError(_) => JsNull
      }
      case _ => JsNull
    }
  }

  val latestSnapFormat = Json.format[LatestSnap]
  val linkSnapFormat = Json.format[LinkSnap]
  val curatedContentFormat = Json.format[CuratedContent]
  val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]

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
  description: Option[String],
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

  lazy val curatedPlusBackfillDeduplicated = (curated ++ backfill).distinctBy(c => c.maybeContentId.getOrElse(c.id))
}

object PressedCollection {
  import FapiJsonFormats._
  implicit val pressedCollectionFormat = Json.format[PressedCollection]

  def fromCollectionWithCuratedAndBackfill(
      collection: com.gu.facia.api.models.Collection,
      curated: List[FaciaContent],
      backfill: List[FaciaContent],
      treats: List[FaciaContent]): PressedCollection =
    PressedCollection(
      collection.id,
      collection.displayName,
      curated,
      backfill,
      treats,
      collection.lastUpdated,
      collection.updatedBy,
      collection.updatedEmail,
      collection.href,
      collection.collectionConfig.description,
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
