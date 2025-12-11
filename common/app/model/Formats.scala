package model

import com.gu.contentapi.client.utils.DesignType
import com.gu.facia.api.models.{GroupConfig, GroupsConfig}
import com.gu.facia.api.utils.BoostLevel
import common.Pagination
import json.ObjectDeduplication.deduplicate
import model.content._
import model.facia.PressedCollection
import model.pressed._
import play.api
import play.api.libs
import play.api.libs.json
import play.api.libs.json._
import play.api.libs.json.JodaReads._

import scala.concurrent.duration.DurationInt

object GenericThriftAtomFormat extends Format[com.gu.contentatom.thrift.Atom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(atom: com.gu.contentatom.thrift.Atom): JsObject = JsObject(Seq.empty)
}

object ReviewThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.review.ReviewAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(review: com.gu.contentatom.thrift.atom.review.ReviewAtom): JsObject = JsObject(Seq.empty)
}

object ExplainerThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.explainer.ExplainerAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(explainer: com.gu.contentatom.thrift.atom.explainer.ExplainerAtom): JsObject = JsObject(Seq.empty)
}

object QandasThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.qanda.QAndAAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(qanda: com.gu.contentatom.thrift.atom.qanda.QAndAAtom): JsObject = JsObject(Seq.empty)
}

object GuidesThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.guide.GuideAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(guide: com.gu.contentatom.thrift.atom.guide.GuideAtom): JsObject = JsObject(Seq.empty)
}

object ProfilesThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.profile.ProfileAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(profile: com.gu.contentatom.thrift.atom.profile.ProfileAtom): JsObject = JsObject(Seq.empty)
}

object TimelinesThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.timeline.TimelineAtom] {
  def reads(json: JsValue): JsError = JsError("Converting from Json is not supported by intent!")
  def writes(timeline: com.gu.contentatom.thrift.atom.timeline.TimelineAtom): JsObject = JsObject(Seq.empty)
}

object BoostLevelFormat extends Format[BoostLevel] {
  def reads(json: JsValue): JsResult[BoostLevel] = {
    json match {
      case JsString("default")   => JsSuccess(BoostLevel.Default)
      case JsString("boost")     => JsSuccess(BoostLevel.Boost)
      case JsString("megaboost") => JsSuccess(BoostLevel.MegaBoost)
      case JsString("gigaboost") => JsSuccess(BoostLevel.GigaBoost)
      case _                     => JsError("Could not convert BoostLevel")
    }
  }

  def writes(boostLevel: BoostLevel): JsValue = {
    boostLevel match {
      case BoostLevel.Default   => JsString("default")
      case BoostLevel.Boost     => JsString("boost")
      case BoostLevel.MegaBoost => JsString("megaboost")
      case BoostLevel.GigaBoost => JsString("gigaboost")
    }
  }
}

object CardStyleFormat extends Format[CardStyle] {
  def reads(json: JsValue): JsResult[CardStyle] = {
    (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("SpecialReport"), _)    => JsSuccess(SpecialReport)
      case JsSuccess(JsString("SpecialReportAlt"), _) => JsSuccess(SpecialReportAlt)
      case JsSuccess(JsString("LiveBlog"), _)         => JsSuccess(LiveBlog)
      case JsSuccess(JsString("DeadBlog"), _)         => JsSuccess(DeadBlog)
      case JsSuccess(JsString("Feature"), _)          => JsSuccess(Feature)
      case JsSuccess(JsString("Editorial"), _)        => JsSuccess(Editorial)
      case JsSuccess(JsString("Comment"), _)          => JsSuccess(Comment)
      case JsSuccess(JsString("Media"), _)            => JsSuccess(Media)
      case JsSuccess(JsString("Analysis"), _)         => JsSuccess(Analysis)
      case JsSuccess(JsString("Review"), _)           => JsSuccess(Review)
      case JsSuccess(JsString("Letters"), _)          => JsSuccess(Letters)
      case JsSuccess(JsString("ExternalLink"), _)     => JsSuccess(ExternalLink)
      case JsSuccess(JsString("DefaultCardstyle"), _) => JsSuccess(DefaultCardstyle)
      case _                                          => JsError("Could not convert CardStyle")
    }
  }

  def writes(cardStyle: CardStyle): JsObject =
    cardStyle match {
      case SpecialReport    => JsObject(Seq("type" -> JsString("SpecialReport")))
      case SpecialReportAlt => JsObject(Seq("type" -> JsString("SpecialReportAlt")))
      case LiveBlog         => JsObject(Seq("type" -> JsString("LiveBlog")))
      case DeadBlog         => JsObject(Seq("type" -> JsString("DeadBlog")))
      case Feature          => JsObject(Seq("type" -> JsString("Feature")))
      case Editorial        => JsObject(Seq("type" -> JsString("Editorial")))
      case Comment          => JsObject(Seq("type" -> JsString("Comment")))
      case Media            => JsObject(Seq("type" -> JsString("Media")))
      case Analysis         => JsObject(Seq("type" -> JsString("Analysis")))
      case Review           => JsObject(Seq("type" -> JsString("Review")))
      case Letters          => JsObject(Seq("type" -> JsString("Letters")))
      case ExternalLink     => JsObject(Seq("type" -> JsString("ExternalLink")))
      case DefaultCardstyle => JsObject(Seq("type" -> JsString("DefaultCardstyle")))
    }
}

object MediaTypeFormat extends Format[MediaType] {
  def reads(json: JsValue): JsResult[MediaType] = {
    (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("Video"), _)   => JsSuccess(pressed.Video)
      case JsSuccess(JsString("Gallery"), _) => JsSuccess(pressed.Gallery)
      case JsSuccess(JsString("Audio"), _)   => JsSuccess(pressed.Audio)
      case _                                 => JsError("Could not convert MediaType")
    }
  }

  def writes(mediaType: MediaType): JsObject =
    mediaType match {
      case pressed.Video   => JsObject(Seq("type" -> JsString("Video")))
      case pressed.Gallery => JsObject(Seq("type" -> JsString("Gallery")))
      case pressed.Audio   => JsObject(Seq("type" -> JsString("Audio")))
    }
}

object PressedContentFormat {

  // This format is implicit because CuratedContent is recursively defined, so it needs a format object in scope.
  implicit object format extends Format[PressedContent] {

    def reads(json: JsValue): JsResult[PressedContent] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("LinkSnap"), _) => {
          // we know a Link Snap will never have Format but this is a required field in DCR so we add a default here.
          val snapLinkJsonWithFormat = json.as[JsObject] + ("format" -> Json.toJson(ContentFormat.defaultContentFormat))
          JsSuccess(snapLinkJsonWithFormat.as[LinkSnap](linkSnapFormat))
        }
        case JsSuccess(JsString("LatestSnap"), _)     => JsSuccess(json.as[LatestSnap](latestSnapFormat))
        case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent](curatedContentFormat))
        case JsSuccess(JsString("SupportingCuratedContent"), _) =>
          JsSuccess(json.as[SupportingCuratedContent](supportingCuratedContentFormat))
        case _ => JsError("Could not convert PressedContent")
      }
    }

    def writes(faciaContent: PressedContent): JsValue =
      faciaContent match {
        case linkSnap: LinkSnap =>
          Json
            .toJson(linkSnap)(linkSnapFormat)
            .transform[JsObject](Reads.JsObjectReads) match {
            case JsSuccess(l, _) =>
              l ++ Json.obj("type" -> "LinkSnap")
            case JsError(_) => JsNull
          }
        case latestSnap: LatestSnap =>
          Json
            .toJson(latestSnap)(latestSnapFormat)
            .transform[JsObject](Reads.JsObjectReads) match {
            case JsSuccess(l, _) =>
              l ++ Json.obj("type" -> "LatestSnap")
            case JsError(_) => JsNull
          }
        case content: CuratedContent =>
          Json
            .toJson(content)(curatedContentFormat)
            .transform[JsObject](Reads.JsObjectReads) match {
            case JsSuccess(l, _) =>
              l ++ Json.obj("type" -> "CuratedContent")
            case JsError(_) => JsNull
          }
        case supporting: SupportingCuratedContent =>
          Json
            .toJson(supporting)(supportingCuratedContentFormat)
            .transform[JsObject](Reads.JsObjectReads) match {
            case JsSuccess(l, _) =>
              l ++ Json.obj("type" -> "SupportingCuratedContent")
            case JsError(_) => JsNull
          }
        case _ => JsNull
      }
  }

  implicit val designTypeFormat: Format[DesignType] = new Format[DesignType] {
    override def reads(json: JsValue): JsResult[DesignType] =
      json match {
        case JsString("Article")              => JsSuccess(com.gu.contentapi.client.utils.Article)
        case JsString("Immersive")            => JsSuccess(com.gu.contentapi.client.utils.Immersive)
        case JsString("Media")                => JsSuccess(com.gu.contentapi.client.utils.Media)
        case JsString("Review")               => JsSuccess(com.gu.contentapi.client.utils.Review)
        case JsString("Analysis")             => JsSuccess(com.gu.contentapi.client.utils.Analysis)
        case JsString("Comment")              => JsSuccess(com.gu.contentapi.client.utils.Comment)
        case JsString("Feature")              => JsSuccess(com.gu.contentapi.client.utils.Feature)
        case JsString("Live")                 => JsSuccess(com.gu.contentapi.client.utils.Live)
        case JsString("SpecialReport")        => JsSuccess(com.gu.contentapi.client.utils.SpecialReport)
        case JsString("Recipe")               => JsSuccess(com.gu.contentapi.client.utils.Recipe)
        case JsString("MatchReport")          => JsSuccess(com.gu.contentapi.client.utils.MatchReport)
        case JsString("Interview")            => JsSuccess(com.gu.contentapi.client.utils.Interview)
        case JsString("GuardianView")         => JsSuccess(com.gu.contentapi.client.utils.GuardianView)
        case JsString("Quiz")                 => JsSuccess(com.gu.contentapi.client.utils.Quiz)
        case JsString("GuardianLabs")         => JsSuccess(com.gu.contentapi.client.utils.GuardianLabs)
        case JsString("AdvertisementFeature") => JsSuccess(com.gu.contentapi.client.utils.AdvertisementFeature)
        case JsString("Newsletter")           => JsSuccess(com.gu.contentapi.client.utils.Newsletter)
        case JsString("Profile")              => JsSuccess(com.gu.contentapi.client.utils.Profile)
        case JsString("Timeline")             => JsSuccess(com.gu.contentapi.client.utils.Timeline)
        case _                                => JsError(s"Unknown design type: '$json'")
      }
    override def writes(dt: DesignType): JsValue =
      dt match {
        case com.gu.contentapi.client.utils.Article              => JsString("Article")
        case com.gu.contentapi.client.utils.Immersive            => JsString("Immersive")
        case com.gu.contentapi.client.utils.Media                => JsString("Media")
        case com.gu.contentapi.client.utils.Review               => JsString("Review")
        case com.gu.contentapi.client.utils.Analysis             => JsString("Analysis")
        case com.gu.contentapi.client.utils.Comment              => JsString("Comment")
        case com.gu.contentapi.client.utils.Feature              => JsString("Feature")
        case com.gu.contentapi.client.utils.Live                 => JsString("Live")
        case com.gu.contentapi.client.utils.SpecialReport        => JsString("SpecialReport")
        case com.gu.contentapi.client.utils.Recipe               => JsString("Recipe")
        case com.gu.contentapi.client.utils.MatchReport          => JsString("MatchReport")
        case com.gu.contentapi.client.utils.Interview            => JsString("Interview")
        case com.gu.contentapi.client.utils.GuardianView         => JsString("GuardianView")
        case com.gu.contentapi.client.utils.Quiz                 => JsString("Quiz")
        case com.gu.contentapi.client.utils.GuardianLabs         => JsString("GuardianLabs")
        case com.gu.contentapi.client.utils.AdvertisementFeature => JsString("AdvertisementFeature")
        case com.gu.contentapi.client.utils.Newsletter           => JsString("Newsletter")
        case com.gu.contentapi.client.utils.Profile              => JsString("Profile")
        case com.gu.contentapi.client.utils.Timeline             => JsString("Timeline")
      }
  }

  implicit val pillarFormat: OFormat[Pillar] = Json.format[Pillar]
  implicit val dateToTimestampWrites: json.JodaWrites.JodaDateTimeNumberWrites.type =
    play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
  implicit val paginationFormat: OFormat[Pagination] = Json.format[Pagination]
  implicit val podcastFormat: OFormat[Podcast] = Json.format[Podcast]
  implicit val referenceFormat: OFormat[Reference] = Json.format[Reference]
  implicit val tagPropertiesFormat: OFormat[TagProperties] = Json.format[TagProperties]
  implicit val tagFormat: Format[Tag] =
    deduplicate(
      Json.format[Tag],
      _.id,
      _.maximumSize(20000) // average Tag retains ~8KB in memory, so 20000 cached Tags retain only 160MB
        .expireAfterAccess(1.hour),
    )
  implicit val tagsFormat: OFormat[Tags] = Json.format[Tags]
  implicit val elementPropertiesFormat: OFormat[ElementProperties] = Json.format[ElementProperties]
  implicit val imageAssetFormat: OFormat[ImageAsset] = Json.format[ImageAsset]
  implicit val videoAssetFormat: OFormat[VideoAsset] = Json.format[VideoAsset]
  implicit val imageMediaFormat: OFormat[ImageMedia] = Json.format[ImageMedia]
  implicit val videoMediaFormat: OFormat[VideoMedia] = Json.format[VideoMedia]
  implicit val videoElementFormat: OFormat[VideoElement] = Json.format[VideoElement]
  implicit val assetDimensionsFormat: OFormat[AssetDimensions] = Json.format[AssetDimensions]
  implicit val mediaAssetFormat: OFormat[MediaAsset] = Json.format[MediaAsset]
  implicit val mediaAtomFormat: OFormat[MediaAtom] = Json.format[MediaAtom]
  implicit val mediaTypeFormat: MediaTypeFormat.type = MediaTypeFormat
  implicit val cardStyleFormat: CardStyleFormat.type = CardStyleFormat
  implicit val faciaImageFormat: FaciaImageFormat.format.type = FaciaImageFormat.format
  implicit val itemKickerFormat: ItemKickerFormat.format.type = ItemKickerFormat.format
  implicit val tagKickerFormat: OFormat[TagKicker] = ItemKickerFormat.tagKickerFormat
  implicit val pressedCardHeader: OFormat[PressedCardHeader] = Json.format[PressedCardHeader]
  implicit val boostLevel: BoostLevelFormat.type = BoostLevelFormat
  implicit val pressedDisplaySettings: OFormat[PressedDisplaySettings] = Json.format[PressedDisplaySettings]
  implicit val pressedDiscussionSettings: OFormat[PressedDiscussionSettings] = Json.format[PressedDiscussionSettings]
  implicit val pressedCard: OFormat[PressedCard] = Json.format[PressedCard]
  implicit val pressedFields: OFormat[PressedFields] = Json.format[PressedFields]
  implicit val pressedTrail: OFormat[PressedTrail] = Json.format[PressedTrail]
  implicit val pressedMetadata: OFormat[PressedMetadata] = Json.format[PressedMetadata]
  implicit val pressedElements: OFormat[PressedElements] = Json.format[PressedElements]
  implicit val pressedStory: OFormat[PressedStory] = Json.format[PressedStory]
  implicit val mediaSelectFormat: OFormat[MediaSelect] = Json.format[MediaSelect]
  implicit val pressedPropertiesFormat: OFormat[PressedProperties] = Json.format[PressedProperties]
  implicit val enrichedContentFormat: OFormat[EnrichedContent] = Json.format[EnrichedContent]

  val latestSnapFormat = Json.format[LatestSnap]
  val linkSnapFormat = Json.format[LinkSnap]
  val curatedContentFormat = Json.format[CuratedContent]
  val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]
}

object ItemKickerFormat {
  implicit val kickerPropertiesFormat: OFormat[KickerProperties] = Json.format[KickerProperties]
  implicit val seriesFormat: OFormat[Series] = Json.format[Series]
  val tagKickerFormat: OFormat[TagKicker] = Json.format[TagKicker]

  private val podcastKickerFormat = Json.format[PodcastKicker]
  private val sectionKickerFormat = Json.format[SectionKicker]
  private val freeHtmlKickerFormat = Json.format[FreeHtmlKicker]
  private val freeHtmlKickerWithLinkFormat = Json.format[FreeHtmlKickerWithLink]

  object format extends Format[ItemKicker] {
    def reads(json: JsValue): JsResult[ItemKicker] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("BreakingNewsKicker"), _) => JsSuccess(BreakingNewsKicker)
        case JsSuccess(JsString("LiveKicker"), _)         => JsSuccess(LiveKicker)
        case JsSuccess(JsString("AnalysisKicker"), _)     => JsSuccess(AnalysisKicker)
        case JsSuccess(JsString("ReviewKicker"), _)       => JsSuccess(ReviewKicker)
        case JsSuccess(JsString("CartoonKicker"), _)      => JsSuccess(CartoonKicker)
        case JsSuccess(JsString("PodcastKicker"), _)  => (json \ "series").validate[PodcastKicker](podcastKickerFormat)
        case JsSuccess(JsString("TagKicker"), _)      => (json \ "item").validate[TagKicker](tagKickerFormat)
        case JsSuccess(JsString("SectionKicker"), _)  => (json \ "item").validate[SectionKicker](sectionKickerFormat)
        case JsSuccess(JsString("FreeHtmlKicker"), _) => (json \ "item").validate[FreeHtmlKicker](freeHtmlKickerFormat)
        case JsSuccess(JsString("FreeHtmlKickerWithLink"), _) =>
          (json \ "item").validate[FreeHtmlKickerWithLink](freeHtmlKickerWithLinkFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(itemKicker: ItemKicker): JsObject =
      itemKicker match {
        case BreakingNewsKicker           => JsObject(Seq("type" -> JsString("BreakingNewsKicker")))
        case LiveKicker                   => JsObject(Seq("type" -> JsString("LiveKicker")))
        case AnalysisKicker               => JsObject(Seq("type" -> JsString("AnalysisKicker")))
        case ReviewKicker                 => JsObject(Seq("type" -> JsString("ReviewKicker")))
        case CartoonKicker                => JsObject(Seq("type" -> JsString("CartoonKicker")))
        case podcastKicker: PodcastKicker =>
          JsObject(
            Seq("type" -> JsString("PodcastKicker"), "series" -> Json.toJson(podcastKicker)(podcastKickerFormat)),
          )
        case tagKicker: TagKicker =>
          JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(tagKicker)(tagKickerFormat)))
        case sectionKicker: SectionKicker =>
          JsObject(Seq("type" -> JsString("SectionKicker"), "item" -> Json.toJson(sectionKicker)(sectionKickerFormat)))
        case freeHtmlKicker: FreeHtmlKicker =>
          JsObject(
            Seq("type" -> JsString("FreeHtmlKicker"), "item" -> Json.toJson(freeHtmlKicker)(freeHtmlKickerFormat)),
          )
        case freeHtmlKickerWithLink: FreeHtmlKickerWithLink =>
          JsObject(
            Seq(
              "type" -> JsString("FreeHtmlKickerWithLink"),
              "item" -> Json.toJson(freeHtmlKickerWithLink)(freeHtmlKickerWithLinkFormat),
            ),
          )
      }
  }
}

object FaciaImageFormat {
  implicit val cutoutFormat: OFormat[Cutout] = Json.format[Cutout]
  implicit val replaceFormat: OFormat[Replace] = Json.format[Replace]
  implicit val slideshowFormat: OFormat[ImageSlideshow] = Json.format[ImageSlideshow]

  object format extends Format[Image] {
    def reads(json: JsValue): JsResult[Image] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Cutout"), _)         => (json \ "item").validate[Cutout](cutoutFormat)
        case JsSuccess(JsString("Replace"), _)        => (json \ "item").validate[Replace](replaceFormat)
        case JsSuccess(JsString("ImageSlideshow"), _) => (json \ "item").validate[ImageSlideshow](slideshowFormat)
        case _                                        => JsError("Could not convert ItemKicker")
      }
    }

    def writes(faciaImage: Image): JsObject =
      faciaImage match {
        case cutout: Cutout => JsObject(Seq("type" -> JsString("Cutout"), "item" -> Json.toJson(cutout)(cutoutFormat)))
        case replace: Replace =>
          JsObject(Seq("type" -> JsString("Replace"), "item" -> Json.toJson(replace)(replaceFormat)))
        case imageSlideshow: ImageSlideshow =>
          JsObject(Seq("type" -> JsString("ImageSlideshow"), "item" -> Json.toJson(imageSlideshow)(slideshowFormat)))
      }
  }
}

object PressedCollectionFormat {
  implicit val dateToTimestampWrites: libs.json.JodaWrites.JodaDateTimeNumberWrites.type =
    play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
  implicit val displayHintsFormat: OFormat[DisplayHints] = Json.format[DisplayHints]
  implicit val groupConfigFormat: OFormat[GroupConfig] = Json.format[GroupConfig]
  implicit val groupsConfigFormat: OFormat[GroupsConfig] = Json.format[GroupsConfig]
  implicit val collectionConfigFormat: OFormat[CollectionConfig] = Json.format[CollectionConfig]
  implicit val pressedContentFormat: PressedContentFormat.format.type = PressedContentFormat.format
  val format: OFormat[PressedCollection] = Json.format[PressedCollection]
}

object PressedPageFormat {
  implicit val dateToTimestampWrites: api.libs.json.JodaWrites.JodaDateTimeNumberWrites.type =
    play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
  implicit val pressedCollection: OFormat[PressedCollection] = PressedCollectionFormat.format
  val format: OFormat[PressedPage] = Json.format[PressedPage]
}
