package implicits

import com.gu.contentapi.client.model.{Content, Element, Tag}
import com.gu.facia.api.models._
import com.gu.facia.api.utils.ItemKicker
import dfp.DfpAgent
import layout.{Video, Audio, Gallery, MediaType}
import model.VideoElement
import model.ApiContentWithMeta
import model.Tags
import model.SupportedUrl
import model.ImageElement
import model.ImageContainer
import model.ImageOverride
import org.joda.time.DateTime
import model.`package`._
import org.scala_tools.time.Imports._

import scala.util.Try

object FaciaContentImplicits {

  import implicits.Dates._

  implicit class FaciaContentHelper(faciaContent: FaciaContent) {

    def fold[T](c: (CuratedContent) => T, scc: (SupportingCuratedContent) => T,
                ls: (LinkSnap) => T, las: (LatestSnap) => T): T = faciaContent match {
      case curatedContent: CuratedContent => c(curatedContent)
      case supportingCuratedContent: SupportingCuratedContent => scc(supportingCuratedContent)
      case linkSnap: LinkSnap => ls(linkSnap)
      case latestSnap: LatestSnap => las(latestSnap)}

    def maybeContent: Option[Content] = fold(
      curatedContent => Option(curatedContent.content),
      supportingCuratedContent => Option(supportingCuratedContent.content),
      linkSnap => None,
      latestSnap => latestSnap.latestContent)

    def tags: List[com.gu.contentapi.client.model.Tag] = fold(
      curatedContent => curatedContent.content.tags,
      supportingCuratedContent => supportingCuratedContent.content.tags,
      _ => Nil,
      _ => Nil)

    def frontendTags = tags.map(_.toFrontendTag)

    def webPublicationDateOption: Option[DateTime] = fold(
        curatedContent => Option(curatedContent.content.webPublicationDate),
        supportingCuratedContent => Option(supportingCuratedContent.content.webPublicationDate),
        _ => None,
        _ => None)

    def webPublicationDate: DateTime = webPublicationDateOption.getOrElse(DateTime.now)

    def url: String = fold(
        curatedContent => SupportedUrl(curatedContent.content),
        supportingCuratedContent => SupportedUrl(supportingCuratedContent.content),
        linkSnap => linkSnap.id,
        latestSnap => latestSnap.id)

    def id: String = fold(
        curatedContent => curatedContent.content.id,
        supportingCuratedContent => supportingCuratedContent.content.id,
        linkSnap => linkSnap.id,
        latestSnap => latestSnap.id)

    def embedType: Option[String] = fold(
        curatedContent => curatedContent.embedType,
        supportingCuratedContent => None,
        linkSnap => Option(linkSnap.snapType),
        latestSnap => Option("latest"))

    def embedCss: Option[String] = fold(
        curatedContent => curatedContent.embedCss,
        supportingCuratedContent => None,
        linkSnap => linkSnap.snapCss,
        latestSnap => latestSnap.snapCss)

    def embedUri: Option[String] = fold(
        curatedContent => curatedContent.embedUri,
        supportingCuratedContent => None,
        linkSnap => linkSnap.snapUri,
        latestSnap => latestSnap.snapUri)

    def itemKicker: Option[ItemKicker] =
      fold(
        curatedContent => curatedContent.kicker,
        supportingCuratedContent => supportingCuratedContent.kicker,
        linkSnap => linkSnap.kicker,
        latestSnap => latestSnap.kicker)

    def headline: String = fold(
        curatedContent => curatedContent.headline,
        supportingCuratedContent => supportingCuratedContent.headline,
        linkSnap => linkSnap.headline.getOrElse("Missing Headline"),
        latestSnap => latestSnap.headline.orElse(latestSnap.latestContent.map(_.webTitle)).getOrElse("Missing Headline"))

    def standfirst: Option[String] = fieldsGet(_.get("standfirst"))
    def body: Option[String] = fieldsGet(_.get("body"))

    def webUrl: Option[String] = fold(
      curatedContent => Option(curatedContent.content.webUrl),
      supportingCuratedContent => Option(supportingCuratedContent.content.webUrl),
      linkSnap => linkSnap.snapUri,
      latestSnap => latestSnap.latestContent.map(_.webUrl))

    val DefaultSnapHref: String = "/"
    def href: String = fold(
        curatedContent => curatedContent.href.getOrElse(SupportedUrl(curatedContent.content)),
        supportingCuratedContent => supportingCuratedContent.href.getOrElse(SupportedUrl(supportingCuratedContent.content)),
        linkSnap => linkSnap.href.orElse(linkSnap.snapUri).getOrElse(DefaultSnapHref),
        latestSnap => latestSnap.latestContent.map(_.id).orElse(latestSnap.snapUri).getOrElse(DefaultSnapHref)
    )

    def mediaType: Option[MediaType] = {
      def mediaTypeFromContent(content: com.gu.contentapi.client.model.Content): Option[MediaType] =
        if (content.isGallery) Option(Gallery)
        else if (content.isAudio) Option(Audio)
        else if (content.isVideo) Option(Video)
        else None

      fold(
        curatedContent => mediaTypeFromContent(curatedContent.content),
        supportingCuratedContent => mediaTypeFromContent(supportingCuratedContent.content),
        //TODO: Carry TrailMetaData through snaps
        linkSnap => None,
        latestSnap => latestSnap.latestContent.flatMap(mediaTypeFromContent)
      )
    }

    def isLiveBlog: Boolean = fold(
      curatedContent => curatedContent.content.isLiveBlog,
      supportingCuratedContent => supportingCuratedContent.content.isLiveBlog,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(_.isLiveBlog)
    )

    def isLive: Boolean = fold(
      curatedContent => curatedContent.content.safeFields.get("liveBloggingNow").exists(_.toBoolean),
      supportingCuratedContent => supportingCuratedContent.content.safeFields.get("liveBloggingNow").exists(_.toBoolean),
      //TODO: Carry TrailMetaData through snaps
      linkSnap => false,
      latestSnap => false
    )

    def isPodcast: Boolean = fold(
      curatedContent => model.Content(ApiContentWithMeta(curatedContent.content)).isPodcast,
      supportingCuratedContent => model.Content(ApiContentWithMeta(supportingCuratedContent.content)).isPodcast,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(c => model.Content(ApiContentWithMeta(c)).isPodcast)
    )

    def isMedia: Boolean = fold(
      curatedContent => curatedContent.content.isMedia,
      supportingCuratedContent => supportingCuratedContent.content.isMedia,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(_.isMedia)
    )

    def isEditorial: Boolean = fold(
      curatedContent => model.Content(ApiContentWithMeta(curatedContent.content)).isEditorial,
      supportingCuratedContent => model.Content(ApiContentWithMeta(supportingCuratedContent.content)).isEditorial,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(c => model.Content(ApiContentWithMeta(c)).isEditorial)
    )

    def isComment: Boolean = fold(
      curatedContent => curatedContent.content.isComment,
      supportingCuratedContent => supportingCuratedContent.content.isComment,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(_.isComment)
    )

    def isAnalysis: Boolean = fold(
      curatedContent => model.Content(ApiContentWithMeta(curatedContent.content)).isAnalysis,
      supportingCuratedContent => model.Content(ApiContentWithMeta(supportingCuratedContent.content)).isAnalysis,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(c => model.Content(ApiContentWithMeta(c)).isAnalysis)
    )

    def isReview: Boolean = fold(
      curatedContent => curatedContent.content.isReview,
      supportingCuratedContent => supportingCuratedContent.content.isReview,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(_.isReview)
    )

    def isLetters: Boolean = fold(
      curatedContent => model.Content(ApiContentWithMeta(curatedContent.content)).isLetters,
      supportingCuratedContent => model.Content(ApiContentWithMeta(supportingCuratedContent.content)).isLetters,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(c => model.Content(ApiContentWithMeta(c)).isLetters)
    )

    def isFeature: Boolean = fold(
      curatedContent => curatedContent.content.isFeature,
      supportingCuratedContent => supportingCuratedContent.content.isFeature,
      linkSnap => false,
      latestSnap => latestSnap.latestContent.exists(_.isFeature)
    )

    private def fieldsExists(f: (Map[String, String]) => Boolean): Boolean = fold(
      curatedContent => f(curatedContent.content.safeFields),
      supportingCuratedContent => f(supportingCuratedContent.content.safeFields),
      _ => false,
      latestSnap => latestSnap.latestContent.exists(c => f(c.safeFields))
    )

    def isCommentable = fieldsExists(_.get("commentable").exists(_.toBoolean))

    def isClosedForComments = fieldsExists(!_.get("commentCloseDate").exists(_.parseISODateTime.isAfterNow))

    private def fieldsGet(f: (Map[String, String]) => Option[String]): Option[String] = fold(
      curatedContent => f(curatedContent.content.safeFields),
      supportingCuratedContent => f(supportingCuratedContent.content.safeFields),
      linkSnap => None,
      latestSnap => latestSnap.latestContent.flatMap(c => f(c.safeFields))
    )

    def maybeShortUrl = fieldsGet(_.get("shortUrl"))

    def shortUrl: String = maybeShortUrl.getOrElse("")

    def shortUrlPath = maybeShortUrl.map(_.replace("http://gu.com", ""))

    def discussionId = shortUrlPath


    def isBoosted: Boolean = fold(
      curatedContent => curatedContent.isBoosted,
      supportingCuratedContent => supportingCuratedContent.isBoosted,
      //TODO: Carry TrailMetaData through snaps
      linkSnap => false,
      latestSnap => false
    )

    def showBoostedHeadline: Boolean = fold(
      curatedContent => curatedContent.showBoostedHeadline,
      supportingCuratedContent => supportingCuratedContent.showBoostedHeadline,
      //TODO: Carry TrailMetaData through snaps
      linkSnap => false,
      latestSnap => false
    )

    def showQuotedHeadline: Boolean = fold(
      curatedContent => curatedContent.showQuotedHeadline,
      supportingCuratedContent => supportingCuratedContent.showQuotedHeadline,
      //TODO: Carry TrailMetaData through snaps
      linkSnap => false,
      latestSnap => false
    )

    def showMainVideo: Boolean = fold(
      curatedContent => curatedContent.showMainVideo,
      supportingCuratedContent => supportingCuratedContent.showMainVideo,
      linkSnap => false,
      latestSnap => latestSnap.showMainVideo
    )

    def imageHide: Boolean = fold(
      curatedContent => curatedContent.imageHide,
      supportingCuratedContent => supportingCuratedContent.imageHide,
      //TODO: Carry TrailMetaData through snaps
      linkSnap => false,
      latestSnap => false
    )

    def sectionName: Option[String] = fold(
      curatedContent => curatedContent.content.sectionName,
      supportingCuratedContent => supportingCuratedContent.content.sectionName,
      linkSnap => None,
      latestSnap => latestSnap.latestContent.flatMap(_.sectionName)
    )

    def maybeSection: Option[String] = fold(
      curatedContent => curatedContent.content.sectionId,
      supportingCuratedContent => supportingCuratedContent.content.sectionId,
      linkSnap => None,
      latestSnap => latestSnap.latestContent.flatMap(_.sectionId)
    )

    def section: String = maybeSection.getOrElse("")

    def byline: Option[String] = fold(
      curatedContent => curatedContent.byline,
      supportingCuratedContent => supportingCuratedContent.byline,
      linkSnap => linkSnap.byline,
      latestSnap => latestSnap.latestContent.flatMap(_.safeFields.get("byline"))
    )

    def showByline: Boolean = fold(
      curatedContent => curatedContent.showByLine,
      supportingCuratedContent => supportingCuratedContent.showByLine,
      linkSnap => linkSnap.showByLine,
      latestSnap => latestSnap.showByLine
    )

    private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.`type` == tagType)

    lazy val keywords: Seq[Tag] = tagsOfType("keyword")
    lazy val nonKeywordTags: Seq[Tag] = tags.filterNot(_.`type` == "keyword")
    lazy val contributors: Seq[Tag] = tagsOfType("contributor")
    lazy val isContributorPage: Boolean = contributors.nonEmpty
    lazy val series: Seq[Tag] = tagsOfType("series")
    lazy val blogs: Seq[Tag] = tagsOfType("blog")
    lazy val tones: Seq[Tag] = tagsOfType("tone")
    lazy val types: Seq[Tag] = tagsOfType("type")

    lazy val isVideo = types.exists(_.id == "type/video")
    lazy val isGallery = types.exists(_.id == "type/gallery")
    lazy val isAudio = types.exists(_.id == "type/audio")
    lazy val isCartoon = types.exists(_.id == Tags.Cartoon)
    lazy val isCrossword = types.exists(_.id == Tags.Crossword)

    def imageCutout: Option[ImageCutout] = fold(
      curatedContent => curatedContent.imageCutout,
      supportingCuratedContent => supportingCuratedContent.imageCutout,
      //TODO: Carry Fields
      linkSnap => None,
      latestSnap => latestSnap.imageCutout
    )

    def supporting: List[FaciaContent] = fold(
      curatedContent => curatedContent.supportingContent,
      supportingCuratedContent => Nil,
      linkSnap => Nil,
      latestSnap => Nil)

    def isAdvertisementFeature: Boolean =
      DfpAgent.isAdvertisementFeature(frontendTags, maybeSection)

    lazy val shouldHidePublicationDate: Boolean = {
      isAdvertisementFeature && webPublicationDateOption.exists(_.isOlderThan(2.weeks))
    }

    def starRating: Option[Int] = Try(fieldsGet(_.get("starRating")).map(_.toInt)).toOption.flatten


    def trailText: Option[String] = fold(
      curatedContent => curatedContent.trailText,
      supportingCuratedContent => supportingCuratedContent.trailText,
      linkSnap => None,
      latestSnap => None)

    def maybeWebTitle: Option[String] = fold(
      curatedContent => Option(curatedContent.content.webTitle),
      supportingCuratedContent => Option(supportingCuratedContent.content.webTitle),
      linkSnap => None,
      latestSnap => latestSnap.latestContent.map(_.webTitle))

    def webTitle: String = maybeWebTitle.getOrElse("")

    def linkText = maybeWebTitle

    //Elements
    def imageReplace: Option[ImageReplace] = fold(
      _.imageReplace,
      _.imageReplace,
      _.image,
      _.image)

    def imageReplaceElement = for(imageReplace <- imageReplace)
      yield ImageOverride.createElementWithOneAsset(imageReplace.imageSrc, imageReplace.imageSrcWidth, imageReplace.imageSrcHeight)

    def elements: List[Element] = imageReplaceElement.toList ::: fold(
      curatedContent => curatedContent.content.elements.getOrElse(Nil),
      supportingCuratedContent => supportingCuratedContent.content.elements.getOrElse(Nil),
      linkSnap => Nil, //TODO: linkSnap Elements
      latestSnap => latestSnap.latestContent.flatMap(_.elements).getOrElse(Nil))

    def frontendElements: List[model.Element] = elements.zipWithIndex.map{case (e, i) => model.Element(e, i)}

    protected lazy val images: Seq[ImageElement] = frontendElements.flatMap {
      case image: ImageElement => Some(image)
      case _ => None
    }
    lazy val thumbnail: Option[ImageElement] = images.find(_.isThumbnail)
    lazy val bodyImages: Seq[ImageElement] = images.filter(_.isBody)

    private val trailPicMinDesiredSize = 460
    val AspectRatioThreshold = 0.01

    def mainPicture: Option[ImageContainer] = images.find(_.isMain)

    // Find a main picture crop which matches this aspect ratio.
    def trailPictureAll(aspectWidth: Int, aspectHeight: Int): List[ImageContainer] = {
      val desiredAspectRatio = aspectWidth.toDouble / aspectHeight

      (thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail)
        .map { image =>
        image.imageCrops.filter { crop =>
          aspectHeight.toDouble * crop.width != 0 &&
            Math.abs((aspectWidth.toDouble * crop.height) / (aspectHeight.toDouble * crop.width) - 1 ) <= AspectRatioThreshold
        } match {
          case Nil => None
          case crops => Option(ImageContainer(crops, image.delegate, image.index))
        }
      }
        .flatten
        .toList
    }

    def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[ImageContainer] = trailPictureAll(aspectWidth, aspectHeight).headOption

    def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize))
      .orElse(mainPicture)
      .orElse(thumbnail)

    protected lazy val videos: Seq[VideoElement] = frontendElements.flatMap {
      case video: VideoElement => Some(video)
      case _ => None
    }

    def mainVideo: Option[VideoElement] = videos.find(_.isMain).headOption

  }

  implicit class ContentTagImplicits(tag: com.gu.contentapi.client.model.Tag) {
    def toFrontendTag: model.Tag = model.Tag(tag)
  }


}
