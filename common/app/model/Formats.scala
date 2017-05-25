package model

import com.gu.contentapi.client.model.v1.MembershipPlaceholder
import common.commercial.CommercialProperties
import common.{NavItem, Pagination, SectionLink}
import model.content._
import model.facia.PressedCollection
import model.liveblog.{BlockAttributes, Blocks, BodyBlock}
import model.pressed._
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json._
import quiz.{Image => _, _}

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
    def reads(json: JsValue): JsResult[Element] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("ImageElement"), _) => (json \ "item").validate[ImageElement](imageElementFormat)
        case JsSuccess(JsString("AudioElement"), _) => (json \ "item").validate[AudioElement](audioElementFormat)
        case JsSuccess(JsString("VideoElement"), _) => (json \ "item").validate[VideoElement](videoElementFormat)
        case JsSuccess(JsString("EmbedElement"), _) => (json \ "item").validate[EmbedElement](embedElementFormat)
        case JsSuccess(JsString("DefaultElement"), _) => (json \ "item").validate[DefaultElement](defaultElementFormat)
        case _ => JsError("Could not convert ImageElement")
      }
    }

    def writes(element: Element): JsObject = element match {
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
  implicit val cacheTimeFormat = Json.format[CacheTime]

  private case class MetaDataPart1(
    id: String,
    url: String,
    webUrl: String,
    sectionSummary: Option[SectionSummary],
    webTitle: String,
    adUnitSuffix: String,
    iosType: Option[String],
    pagination: Option[Pagination],
    description: Option[String],
    rssPath: Option[String])

  private case class MetaDataPart2(
    contentType: String,
    hasHeader: Boolean,
    schemaType: Option[String],
    cacheTime: CacheTime,
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
    isHosted: Boolean,
    twitterPropertiesOverrides: Map[String, String],
    commercial: Option[CommercialProperties]
  )

  val readsMetadata: Reads[MetaData] = {

    implicit val metadata1stPart: Reads[MetaDataPart1] = Json.reads[MetaDataPart1]
    implicit val metadata2ndPart: Reads[MetaDataPart2] = Json.reads[MetaDataPart2]

    // Combine a Builder[Reads] to a function that can create MetaData results in a Reads[MetaData].
    (metadata1stPart and metadata2ndPart) { (part1: MetaDataPart1, part2: MetaDataPart2) => MetaData(
      part1.id,
      part1.url,
      part1.webUrl,
      part1.sectionSummary,
      part1.webTitle,
      part1.adUnitSuffix,
      part1.iosType,
      part1.pagination,
      part1.description,
      part1.rssPath,
      part2.contentType,
      part2.hasHeader,
      part2.schemaType,
      part2.cacheTime,
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
      part2.isHosted,
      part2.twitterPropertiesOverrides,
      commercial = part2.commercial
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
          meta.adUnitSuffix,
          meta.iosType,
          meta.pagination,
          meta.description,
          meta.rssPath),
        MetaDataPart2(
          meta.contentType,
          meta.shouldHideHeaderAndTopAds,
          meta.schemaType,
          meta.cacheTime,
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
          meta.isHosted,
          meta.twitterPropertiesOverrides,
          meta.commercial
        )
      )
    })
  }

  val format: Format[MetaData] = Format[MetaData](readsMetadata, writesMetadata)
}

object ContentTypeFormat {

  implicit val metadataFormat = MetaDataFormat.format
  implicit val paginationFormat = MetaDataFormat.paginationFormat
  implicit val podcastFormat = Json.format[Podcast]
  implicit val referenceFormat = Json.format[Reference]
  implicit val tagPropertiesFormat = Json.format[TagProperties]
  implicit val tagFormat = Json.format[Tag]
  val tagsFormat = Json.format[Tags]
  implicit val imageMediaFormat = ElementsFormat.imageMediaFormat
  implicit val quizImageMediaFormat = Json.format[QuizImageMedia]
  implicit val answerFormat = Json.format[Answer]
  implicit val questionFormat = Json.format[Question]
  implicit val quizResultBucketFormat = Json.format[ResultBucket]
  implicit val quizResultGroupFormat = Json.format[ResultGroup]
  implicit val quizContentFormat = Json.format[QuizContent]
  implicit val quizFormat = Json.format[Quiz]
  implicit val mediaAssetFormat = Json.format[MediaAsset]
  implicit val mediaAtomFormat = Json.format[MediaAtom]
  implicit val explainerAtomFormat = Json.format[ExplainerAtom]
  implicit val interactiveAtomFormat = Json.format[InteractiveAtom]
  implicit val genericThriftAtomFormat = GenericThriftAtomFormat
  implicit val recipeThriftAtomFormat = RecipeThriftAtomFormat
  implicit val reviewThriftAtomFormat = ReviewThriftAtomFormat
  implicit val storyquestionsThriftAtomFormat = StoryquestionsThriftAtomFormat
  implicit val recipeAtomFormat = Json.format[RecipeAtom]
  implicit val reviewAtomFormat = Json.format[ReviewAtom]
  implicit val storyquestionsAtomFormat = Json.format[StoryQuestionsAtom]


  implicit val atomsWrite = Json.writes[Atoms]

  /* Everytime you add a new atom above you will need to add a line for that atom below.
   *
   * We default to an Empty array if we can't find the field in the pressed fronts json. This prevents
   * json serialisation errors at runtime and means that fronts do not have to be repressed simply for adding a new
   * atom here when the fronts will never need to use them.
   *
   * */
  implicit val reads: Reads[Atoms] = (
    (__ \ "quizzes").read[Seq[Quiz]].orElse(Reads.pure(Nil)) and
      (__ \ "media").read[Seq[MediaAtom]].orElse(Reads.pure(Nil)) and
      (__ \ "interactives").read[Seq[InteractiveAtom]].orElse(Reads.pure(Nil)) and
      (__ \ "recipes").read[Seq[RecipeAtom]].orElse(Reads.pure(Nil)) and
      (__ \ "reviews").read[Seq[ReviewAtom]].orElse(Reads.pure(Nil)) and
      (__ \ "storyquestions").read[Seq[StoryQuestionsAtom]].orElse(Reads.pure(Nil)) and
      (__ \ "explainers").read[Seq[ExplainerAtom]].orElse(Reads.pure(Nil))
    )(Atoms.apply _)


  implicit val membershipPlaceholderFormat = Json.format[MembershipPlaceholder]
  implicit val blockAttributesFormat = Json.format[BlockAttributes]
  implicit val bodyBlockFormat = Json.format[BodyBlock]
  implicit val blocksFormat = Json.format[Blocks]
  val fieldsFormat = Json.format[Fields]
  val elementsFormat = ElementsFormat.format
  implicit val tweetFormat = Json.format[Tweet]
  implicit val cardStyleFormat = CardStyleFormat
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
    paFootballTeams: Seq[String],
    javascriptReferences: Seq[JsObject],
    wordCount: Int,
    showByline: Boolean,
    hasStoryPackage: Boolean,
    rawOpenGraphImage: String,
    atoms: Option[Atoms])

  private case class JsonCommercial(
    isInappropriateForSponsorship: Boolean,
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
    (contentJson and commercialJsonFormat and trailJsonFormat and elementsFormat and metadataFormat and fieldsFormat and tagsFormat) {
      (jsonContent: JsonContent,
       jsonCommercial: JsonCommercial,
       jsonTrail: JsonTrail,
       elements: Elements,
       metadata: MetaData,
       fields: Fields,
       tags: Tags
       ) => {

       val sharelinks = ShareLinks.apply(tags, fields, metadata)
       val commercial = Commercial.apply(
         jsonCommercial.isInappropriateForSponsorship,
         jsonCommercial.hasInlineMerchandise
       )
       val trail = Trail.apply(tags, commercial, fields, metadata, elements,
        jsonTrail.webPublicationDate,
        jsonTrail.headline,
        jsonTrail.byline,
        jsonTrail.sectionName,
        jsonTrail.trailPicture,
        jsonTrail.thumbnailPath,
        jsonTrail.discussionId,
        jsonTrail.isCommentable,
        jsonTrail.isClosedForComments
       )

       Content.apply(trail, metadata, tags, commercial, elements, fields, sharelinks,
        jsonContent.atoms,
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
        jsonContent.paFootballTeams,
        jsonContent.javascriptReferences,
        jsonContent.wordCount,
        jsonContent.showByline,
        jsonContent.hasStoryPackage,
        jsonContent.rawOpenGraphImage
       )
      }
    }
  }

  private val writesContent: Writes[Content] = {

    (Json.writes[JsonContent] and Json.writes[JsonCommercial] and Json.writes[JsonTrail] and ElementsFormat.format and MetaDataFormat.writesMetadata and Json.writes[Fields] and Json.writes[Tags])((content: Content) => {
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
          content.paFootballTeams,
          content.javascriptReferences,
          content.wordCount,
          content.showByline,
          content.hasStoryPackage,
          content.rawOpenGraphImage,
          content.atoms
        ),
        JsonCommercial.apply(
          content.commercial.isInappropriateForSponsorship,
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
  implicit val crosswordDimensionsFormat = Json.format[CrosswordDimensions]
  implicit val crosswordCreatorFormat = Json.format[CrosswordCreator]
  implicit val crosswordPositionFormat = Json.format[CrosswordPosition]
  implicit val entryFormat = Json.format[Entry]
  implicit val crosswordDataFormat = Json.format[CrosswordData]

  val articleFormat = Json.format[Article]
  val galleryFormat = Json.format[Gallery]
  val audioFormat = Json.format[Audio]
  val videoFormat = Json.format[Video]
  val interactiveFormat = Json.format[Interactive]
  val imageContentFormat = Json.format[ImageContent]
  val genericContentFormat = Json.format[GenericContent]
  val crosswordContentFormat = Json.format[CrosswordContent]

  object format extends Format[ContentType] {
    def reads(json: JsValue): JsResult[ContentType] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Article"), _) => (json \ "item").validate[Article](articleFormat)
        case JsSuccess(JsString("Gallery"), _) => (json \ "item").validate[Gallery](galleryFormat)
        case JsSuccess(JsString("Audio"), _) => (json \ "item").validate[Audio](audioFormat)
        case JsSuccess(JsString("Video"), _) => (json \ "item").validate[Video](videoFormat)
        case JsSuccess(JsString("Interactive"), _) => (json \ "item").validate[Interactive](interactiveFormat)
        case JsSuccess(JsString("ImageContent"), _) => (json \ "item").validate[ImageContent](imageContentFormat)
        case JsSuccess(JsString("GenericContent"), _) => (json \ "item").validate[GenericContent](genericContentFormat)
        case JsSuccess(JsString("CrosswordContent"), _) => (json \ "item").validate[CrosswordContent](crosswordContentFormat)
        case _ => JsError("Could not convert ContentType")
      }
    }

    def writes(content: ContentType): JsObject = content match {
      case article: Article => JsObject(Seq("type" -> JsString("Article"), "item" -> Json.toJson(article)(articleFormat)))
      case gallery: Gallery => JsObject(Seq("type" -> JsString("Gallery"), "item" -> Json.toJson(gallery)(galleryFormat)))
      case audio: Audio => JsObject(Seq("type" -> JsString("Audio"), "item" -> Json.toJson(audio)(audioFormat)))
      case video: Video => JsObject(Seq("type" -> JsString("Video"), "item" -> Json.toJson(video)(videoFormat)))
      case interactive: Interactive => JsObject(Seq("type" -> JsString("Interactive"), "item" -> Json.toJson(interactive)(interactiveFormat)))
      case image: ImageContent => JsObject(Seq("type" -> JsString("ImageContent"), "item" -> Json.toJson(image)(imageContentFormat)))
      case generic: GenericContent => JsObject(Seq("type" -> JsString("GenericContent"), "item" -> Json.toJson(generic)(genericContentFormat)))
      case crossword: CrosswordContent => JsObject(Seq("type" -> JsString("CrosswordContent"), "item" -> Json.toJson(crossword)(crosswordContentFormat)))
    }
  }
}

object GenericThriftAtomFormat extends Format[com.gu.contentatom.thrift.Atom] {
 def reads(json: JsValue) = JsError("Converting from Json is not supported by intent!")
 def writes(atom: com.gu.contentatom.thrift.Atom) = JsObject(Seq.empty)
}

object RecipeThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.recipe.RecipeAtom] {
 def reads(json: JsValue) = JsError("Converting from Json is not supported by intent!")
 def writes(recipe: com.gu.contentatom.thrift.atom.recipe.RecipeAtom) = JsObject(Seq.empty)
}

object ReviewThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.review.ReviewAtom] {
  def reads(json: JsValue) = JsError("Converting from Json is not supported by intent!")
  def writes(review: com.gu.contentatom.thrift.atom.review.ReviewAtom) = JsObject(Seq.empty)
}

object StoryquestionsThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.storyquestions.StoryQuestionsAtom] {
  def reads(json: JsValue) = JsError("Converting from Json is not supported by intent!")
  def writes(storyquestions: com.gu.contentatom.thrift.atom.storyquestions.StoryQuestionsAtom) = JsObject(Seq.empty)
}

object ExplainerThriftAtomFormat extends Format[com.gu.contentatom.thrift.atom.explainer.ExplainerAtom] {
  def reads(json: JsValue) = JsError("Converting from Json is not supported by intent!")
  def writes(explainer: com.gu.contentatom.thrift.atom.explainer.ExplainerAtom) = JsObject(Seq.empty)
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

  def writes(cardStyle: CardStyle): JsObject = cardStyle match {
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

  def writes(mediaType: MediaType): JsObject = mediaType match {
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

    def writes(faciaContent: PressedContent): JsValue = faciaContent match {
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
  implicit val pressedCardHeader = Json.format[PressedCardHeader]
  implicit val pressedDisplaySettings = Json.format[PressedDisplaySettings]
  implicit val pressedDiscussionSettings = Json.format[PressedDiscussionSettings]
  implicit val pressedCard = Json.format[PressedCard]
  implicit val pressedPropertiesFormat = Json.format[PressedProperties]
  implicit val enrichedContentFormat = Json.format[EnrichedContent]

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
    def reads(json: JsValue): JsResult[ItemKicker] = {
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

    def writes(itemKicker: ItemKicker): JsObject = itemKicker match {
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
    def reads(json: JsValue): JsResult[Image] = {
      (json \ "type").transform[JsString](Reads.JsStringReads) match {
        case JsSuccess(JsString("Cutout"), _) => (json \ "item").validate[Cutout](cutoutFormat)
        case JsSuccess(JsString("Replace"), _) => (json \ "item").validate[Replace](replaceFormat)
        case JsSuccess(JsString("ImageSlideshow"), _) => (json \ "item").validate[ImageSlideshow](slideshowFormat)
        case _ => JsError("Could not convert ItemKicker")
      }
    }

    def writes(faciaImage: Image): JsObject = faciaImage match {
      case cutout: Cutout => JsObject(Seq("type" -> JsString("Cutout"), "item" -> Json.toJson(cutout)(cutoutFormat)))
      case replace: Replace => JsObject(Seq("type" -> JsString("Replace"), "item" -> Json.toJson(replace)(replaceFormat)))
      case imageSlideshow: ImageSlideshow => JsObject(Seq("type" -> JsString("ImageSlideshow"), "item" -> Json.toJson(imageSlideshow)(slideshowFormat)))
    }
  }
}

object PressedCollectionFormat {
  implicit val displayHintsFormat = Json.format[DisplayHints]
  implicit val collectionConfigFormat = Json.format[CollectionConfig]
  implicit val pressedContentFormat = PressedContentFormat.format
  val format  = Json.format[PressedCollection]
}

object PressedPageFormat {
  implicit val pressedCollection = PressedCollectionFormat.format
  val format = Json.format[PressedPage]
}
