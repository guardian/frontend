package model

import com.gu.facia.api.{utils => fapiutils}
import com.gu.contentapi.client.model.Podcast
import common.{NavItem, SectionLink, Pagination}
import model.facia.PressedCollection
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.functional.syntax._
import pressed._

object ElementsFormat {

  implicit val elementPropertiesFormat = Json.format[ElementProperties]
  implicit val imageAssetFormat = Json.format[ImageAsset]
  implicit val videoAssetFormat = Json.format[VideoAsset]
  implicit val audioAssetFormat = Json.format[AudioAsset]
  implicit val embedAssetFormat = Json.format[EmbedAsset]

  implicit val imageMediaFormat = Json.format[ImageMedia]
  implicit val videoMediaFormat = Json.format[VideoMedia]
  implicit val audioMediaFormat = Json.format[AudioMedia]
  implicit val embedMediaFormat = Json.format[EmbedMedia]

  val imageElementFormat = Json.format[ImageElement]
  val videoElementFormat = Json.format[VideoElement]
  val audioElementFormat = Json.format[AudioElement]
  val embedElementFormat = Json.format[EmbedElement]
  val defaultElementFormat = Json.format[DefaultElement]

  implicit object elementFormat extends Format[Element] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("ImageElement"), _) => (json \ "item").validate[ImageElement](imageElementFormat)
        case JsSuccess(JsString("AudioElement"), _) => (json \ "item").validate[AudioElement](audioElementFormat)
        case JsSuccess(JsString("VideoElement"), _) => (json \ "item").validate[VideoElement](videoElementFormat)
        case JsSuccess(JsString("EmbedElement"), _) => (json \ "item").validate[EmbedElement](embedElementFormat)
        case JsSuccess(JsString("DefaultElement"), _) => (json \ "item").validate[DefaultElement](defaultElementFormat)
        case _ => JsError("Could not convert ImageElement")
      }
    }

    def writes(element: Element) = element match {
      case image: ImageElement => JsObject(Seq("type" -> JsString("ImageElement"), "item" -> Json.toJson(image)(imageElementFormat)))
      case audio: AudioElement => JsObject(Seq("type" -> JsString("AudioElement"), "item" -> Json.toJson(audio)(audioElementFormat)))
      case video: VideoElement => JsObject(Seq("type" -> JsString("VideoElement"), "item" -> Json.toJson(video)(videoElementFormat)))
      case embed: EmbedElement => JsObject(Seq("type" -> JsString("EmbedElement"), "item" -> Json.toJson(embed)(embedElementFormat)))
      case default: DefaultElement => JsObject(Seq("type" -> JsString("DefaultElement"), "item" -> Json.toJson(default)(defaultElementFormat)))
    }
  }

  val format = Json.format[Elements]
}

object MetaDataFormat {
  implicit val paginationFormat = Json.format[Pagination]
  implicit val sectionLinkFormat = Json.format[SectionLink]
  implicit val navItemFormat = Json.format[NavItem]

  private case class MetaDataPart1(
    id: String,
    url: String,
    webUrl: String,
    section: String,
    webTitle: String,
    analyticsName: String,
    adUnitSuffix: String,
    iosType: Option[String],
    pagination: Option[Pagination],
    description: Option[String],
    rssPath: Option[String])

  private case class MetaDataPart2(
    contentType: String,
    isImmersive: Boolean,
    schemaType: Option[String],
    cacheSeconds: Int,
    openGraphImages: Seq[String],
    membershipAccess: Option[String],
    isFront: Boolean,
    isPressedPage: Boolean,
    hideUi: Boolean,
    canonicalUrl: Option[String],
    shouldGoogleIndex: Boolean,
    title: Option[String],
    customSignPosting: Option[NavItem],
    javascriptConfigOverrides: Map[String, JsValue],
    opengraphPropertiesOverrides: Map[String, String],
    twitterPropertiesOverrides: Map[String, String])

  val readsMetadata: Reads[MetaData] = {

    implicit val metadata1stPart: Reads[MetaDataPart1] = Json.reads[MetaDataPart1]
    implicit val metadata2ndPart: Reads[MetaDataPart2] = Json.reads[MetaDataPart2]

    // Combine a Builder[Reads] to a function that can create MetaData results in a Reads[MetaData].
    (metadata1stPart and metadata2ndPart) { (part1: MetaDataPart1, part2: MetaDataPart2) => MetaData(
        part1.id,
        part1.url,
        part1.webUrl,
        part1.section,
        part1.webTitle,
        part1.analyticsName,
        part1.adUnitSuffix,
        part1.iosType,
        part1.pagination,
        part1.description,
        part1.rssPath,
        part2.contentType,
        part2.isImmersive,
        part2.schemaType,
        part2.cacheSeconds,
        part2.openGraphImages,
        part2.membershipAccess,
        part2.isFront,
        part2.isPressedPage,
        part2.hideUi,
        part2.canonicalUrl,
        part2.shouldGoogleIndex,
        part2.title,
        part2.customSignPosting,
        part2.javascriptConfigOverrides,
        part2.opengraphPropertiesOverrides,
        part2.twitterPropertiesOverrides
      )
    }
  }

  val writesMetadata: OWrites[MetaData] = {

    (Json.writes[MetaDataPart1] and Json.writes[MetaDataPart2])((meta: MetaData) => {
      // Return a tuple of MetaDataPart1 and MetaDataPart2. This is a handwritten unapply method, converting
      // from the big MetaData class to the smaller classes.
      ( MetaDataPart1(
          meta.id,
          meta.url,
          meta.webUrl,
          meta.section,
          meta.webTitle,
          meta.analyticsName,
          meta.adUnitSuffix,
          meta.iosType,
          meta.pagination,
          meta.description,
          meta.rssPath),
        MetaDataPart2(
          meta.contentType,
          meta.isImmersive,
          meta.schemaType,
          meta.cacheSeconds,
          meta.openGraphImages,
          meta.membershipAccess,
          meta.isFront,
          meta.isPressedPage,
          meta.hideUi,
          meta.canonicalUrl,
          meta.shouldGoogleIndex,
          meta.title,
          meta.customSignPosting,
          meta.javascriptConfigOverrides,
          meta.opengraphPropertiesOverrides,
          meta.twitterPropertiesOverrides
        )
      )
    })
  }

  val format: Format[MetaData] = Format[MetaData](readsMetadata, writesMetadata)
}

object ContentTypeFormat {

  implicit val podcastFormat = Json.format[Podcast]
  implicit val metadataFormat = MetaDataFormat.format
  implicit val tagFormat = Json.format[Tag]
  val tagsFormat = Json.format[Tags]
  val fieldsFormat = Json.format[Fields]
  val elementsFormat = ElementsFormat.format
  implicit val tweetFormat = Json.format[Tweet]
  implicit val cardStyleFormat = CardStyleFormat
  implicit val imageMediaFormat = ElementsFormat.imageMediaFormat
  private val shareLinksJsonFormat = Json.format[JsonShareLinks]
  private val commercialJsonFormat = Json.format[JsonCommercial]
  private val trailJsonFormat = Json.format[JsonTrail]

  // These private classes are denormalised versions of their corresponding model representations. This saves space.
  private case class JsonContent(
    publication: String,
    internalPageCode: String,
    contributorBio: Option[String],
    starRating: Option[Int],
    allowUserGeneratedContent: Boolean,
    isExpired: Boolean,
    productionOffice: Option[String],
    tweets: Seq[Tweet],
    showInRelated: Boolean,
    cardStyle: CardStyle,
    shouldHideAdverts: Boolean,
    witnessAssignment: Option[String],
    isbn: Option[String],
    imdb: Option[String],
    javascriptReferences: Seq[JsObject],
    wordCount: Int,
    resolvedMetaData: fapiutils.ResolvedMetaData,
    hasStoryPackage: Boolean,
    rawOpenGraphImage: String,
    showFooterContainers: Boolean)

  private case class JsonShareLinks(
    elementShareOrder: List[String],
    pageShareOrder: List[String]
  )

  private case class JsonCommercial(
    isInappropriateForSponsorship: Boolean,
    sponsorshipTag: Option[Tag],
    isFoundationSupported: Boolean,
    isAdvertisementFeature: Boolean,
    hasMultipleSponsors: Boolean,
    hasMultipleFeatureAdvertisers: Boolean,
    hasInlineMerchandise: Boolean
  )

  private case class JsonTrail(
    webPublicationDate: DateTime,
    headline: String,
    byline: Option[String],
    sectionName: String,
    trailPicture: Option[ImageMedia],
    thumbnailPath: Option[String],
    discussionId: Option[String],
    isCommentable: Boolean,
    isClosedForComments: Boolean
  )

  private val readsContent: Reads[Content] = {

    val contentJson: Reads[JsonContent] = Json.reads[JsonContent]

    // Combine a Builder[Reads] with a function that can create Content to make a Reads[Content].
    (contentJson and shareLinksJsonFormat and commercialJsonFormat and trailJsonFormat and elementsFormat and metadataFormat and fieldsFormat and tagsFormat) {
      (jsonContent: JsonContent,
       jsonShareLinks: JsonShareLinks,
       jsonCommercial: JsonCommercial,
       jsonTrail: JsonTrail,
       elements: Elements,
       metadata: MetaData,
       fields: Fields,
       tags: Tags) => {

       val sharelinks = ShareLinks.apply(tags, fields, metadata, jsonShareLinks.elementShareOrder, jsonShareLinks.pageShareOrder)
       val commercial = Commercial.apply(tags, metadata,
        jsonCommercial.isInappropriateForSponsorship,
        jsonCommercial.sponsorshipTag,
        jsonCommercial.isFoundationSupported,
        jsonCommercial.isAdvertisementFeature,
        jsonCommercial.hasMultipleSponsors,
        jsonCommercial.hasMultipleFeatureAdvertisers,
        jsonCommercial.hasInlineMerchandise)
       val trail = Trail.apply(tags, commercial, fields, metadata, elements,
        jsonTrail.webPublicationDate,
        jsonTrail.headline,
        jsonTrail.byline,
        jsonTrail.sectionName,
        jsonTrail.trailPicture,
        jsonTrail.thumbnailPath,
        jsonTrail.discussionId,
        jsonTrail.isCommentable,
        jsonTrail.isClosedForComments)

       Content.apply(trail, metadata, tags, commercial, elements, fields, sharelinks,
        jsonContent.publication,
        jsonContent.internalPageCode,
        jsonContent.contributorBio,
        jsonContent.starRating,
        jsonContent.allowUserGeneratedContent,
        jsonContent.isExpired,
        jsonContent.productionOffice,
        jsonContent.tweets,
        jsonContent.showInRelated,
        jsonContent.cardStyle,
        jsonContent.shouldHideAdverts,
        jsonContent.witnessAssignment,
        jsonContent.isbn,
        jsonContent.imdb,
        jsonContent.javascriptReferences,
        jsonContent.wordCount,
        jsonContent.resolvedMetaData,
        jsonContent.hasStoryPackage,
        jsonContent.rawOpenGraphImage,
        jsonContent.showFooterContainers
       )
      }
    }
  }

  private val writesContent: Writes[Content] = {

    (Json.writes[JsonContent] and Json.writes[JsonShareLinks] and Json.writes[JsonCommercial] and Json.writes[JsonTrail] and ElementsFormat.format and MetaDataFormat.writesMetadata and Json.writes[Fields] and Json.writes[Tags])((content: Content) => {
      // Return a tuple of decomposed classes. This is a handwritten unapply method, converting
      // from the big Content class to the smaller classes.
      ( JsonContent.apply(
          content.publication,
          content.internalPageCode,
          content.contributorBio,
          content.starRating,
          content.allowUserGeneratedContent,
          content.isExpired,
          content.productionOffice,
          content.tweets,
          content.showInRelated,
          content.cardStyle,
          content.shouldHideAdverts,
          content.witnessAssignment,
          content.isbn,
          content.imdb,
          content.javascriptReferences,
          content.wordCount,
          content.resolvedMetaData,
          content.hasStoryPackage,
          content.rawOpenGraphImage,
          content.showFooterContainers
        ),
        JsonShareLinks.apply(content.sharelinks.elementShareOrder, content.sharelinks.pageShareOrder),
        JsonCommercial.apply(
          content.commercial.isInappropriateForSponsorship,
          content.commercial.sponsorshipTag,
          content.commercial.isFoundationSupported,
          content.commercial.isAdvertisementFeature,
          content.commercial.hasMultipleSponsors,
          content.commercial.hasMultipleFeatureAdvertisers,
          content.commercial.hasInlineMerchandise
        ),
        JsonTrail.apply(
          content.trail.webPublicationDate,
          content.trail.headline,
          content.trail.byline,
          content.trail.sectionName,
          content.trail.trailPicture,
          content.trail.thumbnailPath,
          content.trail.discussionId,
          content.trail.isCommentable,
          content.trail.isClosedForComments
        ),
        content.elements,
        content.metadata,
        content.fields,
        content.tags
      )
    })
  }

  implicit val contentFormat: Format[Content] = Format[Content](readsContent, writesContent)
  implicit val lightboxFormat = Json.format[GenericLightboxProperties]
  implicit val galleryLightboxFormat = Json.format[GalleryLightboxProperties]

  val articleFormat = Json.format[Article]
  val galleryFormat = Json.format[Gallery]
  val audioFormat = Json.format[Audio]
  val videoFormat = Json.format[Video]
  val interactiveFormat = Json.format[Interactive]
  val imageContentFormat = Json.format[ImageContent]
  val genericContentFormat = Json.format[GenericContent]

  object format extends Format[ContentType] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Article"), _) => (json \ "item").validate[Article](articleFormat)
        case JsSuccess(JsString("Gallery"), _) => (json \ "item").validate[Gallery](galleryFormat)
        case JsSuccess(JsString("Audio"), _) => (json \ "item").validate[Audio](audioFormat)
        case JsSuccess(JsString("Video"), _) => (json \ "item").validate[Video](videoFormat)
        case JsSuccess(JsString("Interactive"), _) => (json \ "item").validate[Interactive](interactiveFormat)
        case JsSuccess(JsString("ImageContent"), _) => (json \ "item").validate[ImageContent](imageContentFormat)
        case JsSuccess(JsString("GenericContent"), _) => (json \ "item").validate[GenericContent](genericContentFormat)
        case _ => JsError("Could not convert ContentType")
      }
    }

    def writes(content: ContentType) = content match {
      case article: Article => JsObject(Seq("type" -> JsString("Article"), "item" -> Json.toJson(article)(articleFormat)))
      case gallery: Gallery => JsObject(Seq("type" -> JsString("Gallery"), "item" -> Json.toJson(gallery)(galleryFormat)))
      case audio: Audio => JsObject(Seq("type" -> JsString("Audio"), "item" -> Json.toJson(audio)(audioFormat)))
      case video: Video => JsObject(Seq("type" -> JsString("Video"), "item" -> Json.toJson(video)(videoFormat)))
      case interactive: Interactive => JsObject(Seq("type" -> JsString("Interactive"), "item" -> Json.toJson(interactive)(interactiveFormat)))
      case image: ImageContent => JsObject(Seq("type" -> JsString("ImageContent"), "item" -> Json.toJson(image)(imageContentFormat)))
      case generic: GenericContent => JsObject(Seq("type" -> JsString("GenericContent"), "item" -> Json.toJson(generic)(genericContentFormat)))
    }
  }
}

object CardStyleFormat extends Format[CardStyle] {
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
      case _ => JsError("Could not convert CardStyle")
    }
  }

  def writes(cardStyle: CardStyle) = cardStyle match {
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

object MediaTypeFormat extends Format[MediaType] {
  def reads(json: JsValue) = {
    (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("Video"), _) => JsSuccess(pressed.Video)
      case JsSuccess(JsString("Gallery"), _) => JsSuccess(pressed.Gallery)
      case JsSuccess(JsString("Audio"), _) => JsSuccess(pressed.Audio)
      case _ => JsError("Could not convert MediaType")
    }
  }

  def writes(mediaType: MediaType) = mediaType match {
    case pressed.Video => JsObject(Seq("type" -> JsString("Video")))
    case pressed.Gallery => JsObject(Seq("type" -> JsString("Gallery")))
    case pressed.Audio => JsObject(Seq("type" -> JsString("Audio")))
  }
}

object PressedContentFormat {

  // This format is implicit because CuratedContent is recursively defined, so it needs a format object in scope.
  implicit object format extends Format[PressedContent] {

    def reads(json: JsValue) = (json \ "type").transform[JsString](Reads.JsStringReads) match {
      case JsSuccess(JsString("LinkSnap"), _) => JsSuccess(json.as[LinkSnap](linkSnapFormat))
      case JsSuccess(JsString("LatestSnap"), _) => JsSuccess(json.as[LatestSnap](latestSnapFormat))
      case JsSuccess(JsString("CuratedContent"), _) => JsSuccess(json.as[CuratedContent](curatedContentFormat))
      case JsSuccess(JsString("SupportingCuratedContent"), _) => JsSuccess(json.as[SupportingCuratedContent](supportingCuratedContentFormat))
      case _ => JsError("Could not convert PressedContent")
    }

    def writes(faciaContent: PressedContent) = faciaContent match {
      case linkSnap: LinkSnap => Json.toJson(linkSnap)(linkSnapFormat)
        .transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LinkSnap")
        case JsError(_) => JsNull
      }
      case latestSnap: LatestSnap => Json.toJson(latestSnap)(latestSnapFormat)
        .transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "LatestSnap")
        case JsError(_) => JsNull
      }
      case content: CuratedContent => Json.toJson(content)(curatedContentFormat)
        .transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "CuratedContent")
        case JsError(_) => JsNull
      }
      case supporting: SupportingCuratedContent => Json.toJson(supporting)(supportingCuratedContentFormat)
        .transform[JsObject](Reads.JsObjectReads) match {
        case JsSuccess(l, _) =>
          l ++ Json.obj("type" -> "SupportingCuratedContent")
        case JsError(_) => JsNull
      }
      case _ => JsNull
    }
  }

  implicit val mediaTypeFormat = MediaTypeFormat
  implicit val cardStyleFormat = CardStyleFormat
  implicit val faciaImageFormat = FaciaImageFormat.format
  implicit val contentTypeFormat = ContentTypeFormat.format
  implicit val itemKickerFormat = ItemKickerFormat.format
  implicit val tagKickerFormat = ItemKickerFormat.tagKickerFormat
  implicit val pressedPressedCardHeader = Json.format[PressedCardHeader]
  implicit val pressedPressedDisplaySettings = Json.format[PressedDisplaySettings]
  implicit val pressedPressedDiscussionSettings = Json.format[PressedDiscussionSettings]
  implicit val pressedPressedCard = Json.format[PressedCard]
  implicit val pressedPropertiesFormat = Json.format[PressedProperties]

  val latestSnapFormat = Json.format[LatestSnap]
  val linkSnapFormat = Json.format[LinkSnap]
  val curatedContentFormat = Json.format[CuratedContent]
  val supportingCuratedContentFormat = Json.format[SupportingCuratedContent]
}

object ItemKickerFormat {
  implicit val kickerPropertiesFormat = Json.format[KickerProperties]
  implicit val seriesFormat = Json.format[Series]
  val tagKickerFormat = Json.format[TagKicker]

  private val podcastKickerFormat = Json.format[PodcastKicker]
  private val sectionKickerFormat = Json.format[SectionKicker]
  private val freeHtmlKickerFormat = Json.format[FreeHtmlKicker]
  private val freeHtmlKickerWithLinkFormat = Json.format[FreeHtmlKickerWithLink]

  object format extends Format[ItemKicker] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("BreakingNewsKicker"), _) => JsSuccess(BreakingNewsKicker)
        case JsSuccess(JsString("LiveKicker"), _) => JsSuccess(LiveKicker)
        case JsSuccess(JsString("AnalysisKicker"), _) => JsSuccess(AnalysisKicker)
        case JsSuccess(JsString("ReviewKicker"), _) => JsSuccess(ReviewKicker)
        case JsSuccess(JsString("CartoonKicker"), _) => JsSuccess(CartoonKicker)
        case JsSuccess(JsString("PodcastKicker"), _) => (json \ "series").validate[PodcastKicker](podcastKickerFormat)
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
      case podcastKicker: PodcastKicker => JsObject(Seq("type" -> JsString("PodcastKicker"), "series" -> Json.toJson(podcastKicker)(podcastKickerFormat)))
      case tagKicker: TagKicker => JsObject(Seq("type" -> JsString("TagKicker"), "item" -> Json.toJson(tagKicker)(tagKickerFormat)))
      case sectionKicker: SectionKicker => JsObject(Seq("type" -> JsString("SectionKicker"), "item" -> Json.toJson(sectionKicker)(sectionKickerFormat)))
      case freeHtmlKicker: FreeHtmlKicker => JsObject(Seq("type" -> JsString("FreeHtmlKicker"), "item" -> Json.toJson(freeHtmlKicker)(freeHtmlKickerFormat)))
      case freeHtmlKickerWithLink: FreeHtmlKickerWithLink => JsObject(Seq("type" -> JsString("FreeHtmlKickerWithLink"), "item" -> Json.toJson(freeHtmlKickerWithLink)(freeHtmlKickerWithLinkFormat)))
    }
  }
}

object FaciaImageFormat {
  implicit val cutoutFormat = Json.format[Cutout]
  implicit val replaceFormat = Json.format[Replace]
  implicit val slideshowFormat = Json.format[ImageSlideshow]

  object format extends Format[Image] {
    def reads(json: JsValue) = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Cutout"), _) => (json \ "item").validate[Cutout](cutoutFormat)
        case JsSuccess(JsString("Replace"), _) => (json \ "item").validate[Replace](replaceFormat)
        case JsSuccess(JsString("ImageSlideshow"), _) => (json \ "item").validate[ImageSlideshow](slideshowFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(faciaImage: Image) = faciaImage match {
      case cutout: Cutout => JsObject(Seq("type" -> JsString("Cutout"), "item" -> Json.toJson(cutout)(cutoutFormat)))
      case replace: Replace => JsObject(Seq("type" -> JsString("Replace"), "item" -> Json.toJson(replace)(replaceFormat)))
      case imageSlideshow: ImageSlideshow => JsObject(Seq("type" -> JsString("ImageSlideshow"), "item" -> Json.toJson(imageSlideshow)(slideshowFormat)))
    }
  }
}

object PressedCollectionFormat {
  implicit val collectionConfigFormat = Json.format[CollectionConfig]
  implicit val pressedContentFormat = PressedContentFormat.format
  val format  = Json.format[PressedCollection]
}

object PressedPageFormat {
  implicit val pressedCollection = PressedCollectionFormat.format
  val format = Json.format[PressedPage]
}