package model.dotcomrendering.pageElements

import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.ElementType.{Map => _, _}
import com.gu.contentapi.client.model.v1.{
  ElementType,
  SponsorshipType,
  BlockElement => ApiBlockElement,
  Sponsorship => ApiSponsorship,
}
import conf.Configuration
import layout.ContentWidths.DotcomRenderingImageRoleWidthByBreakpointMapping
import model.content._
import model.{ImageAsset, ImageElement, ImageMedia, VideoAsset}
import org.jsoup.Jsoup
import play.api.libs.json._
import views.support.cleaner.SoundcloudHelper
import views.support.{ImgSrc, SrcSet, Video700}

import scala.collection.JavaConverters._

// TODO dates are being rendered as strings to avoid duplication of the
// to-string logic, but ultimately we should pass unformatted date info to
// DCR.
case class TimelineEvent(
    title: String,
    date: String,
    body: Option[String],
    toDate: Option[String],
)
object TimelineEvent {
  implicit val TimelineEventWrites: Writes[TimelineEvent] = Json.writes[TimelineEvent]
}

case class Sponsorship(
    sponsorName: String,
    sponsorLogo: String,
    sponsorLink: String,
    sponsorshipType: SponsorshipType,
)
object Sponsorship {
  def apply(sponsorship: ApiSponsorship): Sponsorship = {
    Sponsorship(
      sponsorship.sponsorName,
      sponsorship.sponsorLogo,
      sponsorship.sponsorLink,
      sponsorship.sponsorshipType,
    )
  }
  implicit val SponsorshipWrites: Writes[Sponsorship] = new Writes[Sponsorship] {
    def writes(sponsorship: Sponsorship): JsObject =
      Json.obj(
        "sponsorName" -> sponsorship.sponsorName,
        "sponsorLogo" -> sponsorship.sponsorLogo,
        "sponsorLink" -> sponsorship.sponsorLink,
        "sponsorshipType" -> sponsorship.sponsorshipType.name,
      )
  }
}

case class NSImage1(url: String, width: Long)
object NSImage1 {
  implicit val NSImage1Writes: Writes[NSImage1] = Json.writes[NSImage1]
  def imageMediaToSequence(image: ImageMedia): Seq[NSImage1] = {
    image.imageCrops
      .filter(_.url.isDefined)
      .map(i => NSImage1(i.url.get, i.fields("width").toLong))
    // calling .get is safe here because of the previous filter
  }
}

// ------------------------------------------------------
// PageElement
// ------------------------------------------------------

/*
  These elements are used for the Dotcom Rendering, they are essentially the new version of the
  model.liveblog._ elements but replaced in full here
 */

sealed trait PageElement

case class AudioAtomBlockElement(
    id: String,
    kicker: String,
    title: Option[String],
    coverUrl: String,
    trackUrl: String,
    duration: Int,
    contentId: String,
) extends PageElement
object AudioAtomBlockElement {
  implicit val AudioAtomBlockElementWrites: Writes[AudioAtomBlockElement] = Json.writes[AudioAtomBlockElement]
}

// We are currently using AudioBlockElement as a catch all for audio errors, skipping the first definition
// See comment: 2e5ac4fd-e7f1-4c04-bdcd-ceadd2dc5d4c
// case class AudioBlockElement(assets: Seq[AudioAsset]) extends PageElement
case class AudioBlockElement(message: String) extends PageElement
object AudioBlockElement {
  implicit val AudioBlockElementWrites: Writes[AudioBlockElement] = Json.writes[AudioBlockElement]
}

case class BlockquoteBlockElement(html: String) extends PageElement
object BlockquoteBlockElement {
  implicit val BlockquoteBlockElementWrites: Writes[BlockquoteBlockElement] = Json.writes[BlockquoteBlockElement]
}

case class CalloutBlockElement(
    id: String,
    calloutsUrl: Option[String],
    activeFrom: Long,
    displayOnSensitive: Boolean,
    formId: Int,
    title: String,
    description: String,
    tagName: String,
    formFields: List[CalloutFormField],
) extends PageElement
object CalloutBlockElement {
  implicit val CalloutBlockElementWrites: Writes[CalloutBlockElement] = Json.writes[CalloutBlockElement]
}

// The extension of the ChartAtomBlockElement, is experimental. Three fields have been added,
// html: String, css: Option[String], js: Option[String], but it looks like, the html string we get from CAPI,
// contains all the css and js required to display the atom.
// Note tha The CAPI answer also gives structured data, so maybe one day we could try and use that instead of
// precompiled html.
case class ChartAtomBlockElement(id: String, url: String, html: String, css: Option[String], js: Option[String])
    extends PageElement
object ChartAtomBlockElement {
  implicit val ChartAtomBlockElementWrites: Writes[ChartAtomBlockElement] = Json.writes[ChartAtomBlockElement]
}

case class CodeBlockElement(html: Option[String], isMandatory: Boolean) extends PageElement
object CodeBlockElement {
  implicit val CodeBlockElementWrites: Writes[CodeBlockElement] = Json.writes[CodeBlockElement]
}

case class CommentBlockElement(
    body: String,
    avatarURL: String,
    profileURL: String,
    profileName: String,
    permalink: String,
    dateTime: String,
) extends PageElement
object CommentBlockElement {
  implicit val CommentBlockElementWrites: Writes[CommentBlockElement] = Json.writes[CommentBlockElement]
}

case class ContentAtomBlockElement(atomId: String) extends PageElement
object ContentAtomBlockElement {
  implicit val ContentAtomBlockElementWrites: Writes[ContentAtomBlockElement] = Json.writes[ContentAtomBlockElement]
}

case class DisclaimerBlockElement(html: String) extends PageElement
object DisclaimerBlockElement {
  implicit val DisclaimerBlockElementWrites: Writes[DisclaimerBlockElement] = Json.writes[DisclaimerBlockElement]
}

case class DocumentBlockElement(
    embedUrl: Option[String],
    height: Option[Int],
    width: Option[Int],
    title: Option[String],
    isMandatory: Option[Boolean],
) extends PageElement
object DocumentBlockElement {
  implicit val DocumentBlockElementWrites: Writes[DocumentBlockElement] = Json.writes[DocumentBlockElement]
}

case class EmbedBlockElement(html: String, safe: Option[Boolean], alt: Option[String], isMandatory: Boolean)
    extends PageElement
object EmbedBlockElement {
  implicit val EmbedBlockElementWrites: Writes[EmbedBlockElement] = Json.writes[EmbedBlockElement]
}

case class ExplainerAtomBlockElement(id: String, title: String, body: String) extends PageElement
object ExplainerAtomBlockElement {
  implicit val ExplainerAtomBlockElementWrites: Writes[ExplainerAtomBlockElement] =
    Json.writes[ExplainerAtomBlockElement]

}

case class FormBlockElement(html: Option[String]) extends PageElement
object FormBlockElement {
  implicit val FormBlockElementWrites: Writes[FormBlockElement] = Json.writes[FormBlockElement]
}

case class GenericAtomBlockElement(
    id: String,
    url: String,
    html: Option[String],
    css: Option[String],
    js: Option[String],
) extends PageElement
// GenericAtomBlockElement is the only BlockElement, despite following the Atom BlockElement naming convention, that doesn't correspond to a single atom type.
// We use it to carry to DCR atoms that do not (yet) have their on dedicated BlockElement and are rendered in DCR as iframes.
//     - {url} for src
//     - {html, css, js} for srcdoc
object GenericAtomBlockElement {
  implicit val GenericAtomBlockElementWrites: Writes[GenericAtomBlockElement] = Json.writes[GenericAtomBlockElement]
}

case class GuideAtomBlockElementItem(title: Option[String], body: String)
object GuideAtomBlockElementItem {
  implicit val GuideAtomBlockElementItemWrites: Writes[GuideAtomBlockElementItem] =
    Json.writes[GuideAtomBlockElementItem]
}
case class GuideAtomBlockElement(
    id: String,
    label: String,
    title: String,
    img: Option[String],
    html: String,
    items: List[GuideAtomBlockElementItem],
    credit: String,
) extends PageElement
object GuideAtomBlockElement {
  implicit val GuideAtomBlockElementWrites: Writes[GuideAtomBlockElement] = Json.writes[GuideAtomBlockElement]
}

case class GuVideoBlockElement(
    assets: Seq[VideoAsset],
    imageMedia: ImageMedia,
    caption: String,
    url: String,
    originalUrl: String,
    html: String,
    source: String,
    role: Role,
) extends PageElement
object GuVideoBlockElement {
  implicit val GuVideoBlockElementWrites: Writes[GuVideoBlockElement] = Json.writes[GuVideoBlockElement]
}

case class ImageSource(weighting: String, srcSet: Seq[SrcSet])
object ImageSource {
  implicit val ImageSourceWrites: Writes[ImageSource] = Json.writes[ImageSource]
}

case class ImageBlockElement(
    media: ImageMedia,
    data: Map[String, String],
    displayCredit: Option[Boolean],
    role: Role,
    imageSources: Seq[ImageSource],
) extends PageElement
object ImageBlockElement {
  implicit val ImageBlockElementWrites: Writes[ImageBlockElement] = Json.writes[ImageBlockElement]
}

case class InteractiveAtomBlockElement(
    id: String,
    url: String,
    html: Option[String],
    css: Option[String],
    js: Option[String],
    placeholderUrl: Option[String],
) extends PageElement
object InteractiveAtomBlockElement {
  implicit val InteractiveAtomBlockElementWrites: Writes[InteractiveAtomBlockElement] =
    Json.writes[InteractiveAtomBlockElement]
}

case class InteractiveBlockElement(url: String) extends PageElement
object InteractiveBlockElement {
  implicit val InteractiveBlockElementWrites: Writes[InteractiveBlockElement] = Json.writes[InteractiveBlockElement]
}

case class InstagramBlockElement(url: String, html: Option[String], hasCaption: Boolean) extends PageElement
object InstagramBlockElement {
  implicit val InstagramBlockElementWrites: Writes[InstagramBlockElement] = Json.writes[InstagramBlockElement]
}

case class MapBlockElement(
    embedUrl: String,
    originalUrl: String,
    source: String,
    caption: String,
    title: String,
    width: Int,
    height: Int,
) extends PageElement
object MapBlockElement {
  implicit val MapBlockElementWrites: Writes[MapBlockElement] = Json.writes[MapBlockElement]
}

case class MediaAtomBlockElementMediaAsset(
    url: String,
    mimeType: Option[String],
)
object MediaAtomBlockElementMediaAsset {
  implicit val MediaAtomBlockElementMediaAssetWrites: Writes[MediaAtomBlockElementMediaAsset] =
    Json.writes[MediaAtomBlockElementMediaAsset]
  def fromMediaAsset(asset: MediaAsset): MediaAtomBlockElementMediaAsset = {
    MediaAtomBlockElementMediaAsset(asset.id, asset.mimeType)
  }
}
case class MediaAtomBlockElement(
    id: String,
    title: String,
    defaultHtml: String,
    assets: Seq[MediaAtomBlockElementMediaAsset],
    duration: Option[Long],
    posterImage: Option[Seq[NSImage1]],
    expired: Option[Boolean],
    activeVersion: Option[Long],
    channelId: Option[String],
) extends PageElement
object MediaAtomBlockElement {
  implicit val MediaAtomBlockElementWrites: Writes[MediaAtomBlockElement] = Json.writes[MediaAtomBlockElement]
}

case class MembershipBlockElement(
    originalUrl: Option[String],
    linkText: Option[String],
    linkPrefix: Option[String],
    title: Option[String],
    venue: Option[String],
    location: Option[String],
    identifier: Option[String],
    image: Option[String],
    price: Option[String],
) extends PageElement
object MembershipBlockElement {
  implicit val MembershipBlockElementWrites: Writes[MembershipBlockElement] = Json.writes[MembershipBlockElement]
}

case class ProfileAtomBlockElementItem(title: Option[String], body: String)
object ProfileAtomBlockElementItem {
  implicit val GuideAtomBlockElementItemWrites: Writes[ProfileAtomBlockElementItem] =
    Json.writes[ProfileAtomBlockElementItem]
}

case class ProfileAtomBlockElement(
    id: String,
    label: String,
    title: String,
    img: Option[String],
    html: String,
    items: List[ProfileAtomBlockElementItem],
    credit: String,
) extends PageElement
object ProfileAtomBlockElement {
  implicit val ProfileAtomBlockElementWrites: Writes[ProfileAtomBlockElement] = Json.writes[ProfileAtomBlockElement]
}
case class PullquoteBlockElement(html: Option[String], role: Role, attribution: Option[String]) extends PageElement
object PullquoteBlockElement {
  implicit val PullquoteBlockElementWrites: Writes[PullquoteBlockElement] = Json.writes[PullquoteBlockElement]
}

case class QABlockElement(id: String, title: String, img: Option[String], html: String, credit: String)
    extends PageElement
object QABlockElement {
  implicit val QABlockElementWrites: Writes[QABlockElement] = Json.writes[QABlockElement]
}

case class QuizAtomAnswer(id: String, text: String, revealText: Option[String], isCorrect: Boolean)
case class QuizAtomQuestion(id: String, text: String, answers: Seq[QuizAtomAnswer], imageUrl: Option[String])
case class QuizAtomBlockElement(id: String, questions: Seq[QuizAtomQuestion]) extends PageElement
object QuizAtomBlockElement {
  implicit val QuizAtomAnswerWrites: Writes[QuizAtomAnswer] = Json.writes[QuizAtomAnswer]
  implicit val QuizAtomQuestionWrites: Writes[QuizAtomQuestion] = Json.writes[QuizAtomQuestion]
  implicit val QuizAtomBlockElementWrites: Writes[QuizAtomBlockElement] = Json.writes[QuizAtomBlockElement]
}

case class RichLinkBlockElement(
    url: Option[String],
    text: Option[String],
    prefix: Option[String],
    role: Role,
    sponsorship: Option[Sponsorship],
) extends PageElement
object RichLinkBlockElement {
  implicit val RichLinkBlockElementWrites: Writes[RichLinkBlockElement] = Json.writes[RichLinkBlockElement]
}

case class SoundcloudBlockElement(html: String, id: String, isTrack: Boolean, isMandatory: Boolean) extends PageElement
object SoundcloudBlockElement {
  implicit val SoundCloudBlockElementWrites: Writes[SoundcloudBlockElement] = Json.writes[SoundcloudBlockElement]
}

case class SpotifyBlockElement(
    embedUrl: Option[String],
    height: Option[Int],
    width: Option[Int],
    title: Option[String],
    caption: Option[String],
) extends PageElement
object SpotifyBlockElement {
  implicit val SpotifyBlockElementWrites: Writes[SpotifyBlockElement] = Json.writes[SpotifyBlockElement]
}

case class SubheadingBlockElement(html: String) extends PageElement
object SubheadingBlockElement {
  implicit val SubheadingBlockElementWrites: Writes[SubheadingBlockElement] = Json.writes[SubheadingBlockElement]
}

case class TableBlockElement(html: Option[String], role: Role, isMandatory: Option[Boolean]) extends PageElement
object TableBlockElement {
  implicit val TableBlockElementWrites: Writes[TableBlockElement] = Json.writes[TableBlockElement]
}

case class TextBlockElement(html: String) extends PageElement
object TextBlockElement {
  implicit val TextBlockElementWrites: Writes[TextBlockElement] = Json.writes[TextBlockElement]
}

case class TimelineBlockElement(id: String, title: String, description: Option[String], events: Seq[TimelineEvent])
    extends PageElement
object TimelineBlockElement {
  implicit val TimelineBlockElementWrites: Writes[TimelineBlockElement] = Json.writes[TimelineBlockElement]
}

case class TweetBlockElement(html: String, url: String, id: String, hasMedia: Boolean, role: Role) extends PageElement
object TweetBlockElement {
  implicit val TweetBlockElementWrites: Writes[TweetBlockElement] = Json.writes[TweetBlockElement]
}

case class UnknownBlockElement(html: Option[String]) extends PageElement
object UnknownBlockElement {
  implicit val UnknownBlockElementWrites: Writes[UnknownBlockElement] = Json.writes[UnknownBlockElement]
}

case class VideoBlockElement(
    caption: Option[String],
    url: String,
    originalUrl: String,
    height: Int,
    width: Int,
    role: Role,
) extends PageElement
object VideoBlockElement {
  implicit val VideoBlockElementWrites: Writes[VideoBlockElement] = Json.writes[VideoBlockElement]
}

case class VideoFacebookBlockElement(
    caption: Option[String],
    url: String,
    originalUrl: String,
    embedUrl: Option[String],
    height: Int,
    width: Int,
    role: Role,
) extends PageElement
object VideoFacebookBlockElement {
  implicit val VideoFacebookBlockElementWrites: Writes[VideoFacebookBlockElement] =
    Json.writes[VideoFacebookBlockElement]
}

case class VideoVimeoBlockElement(
    caption: Option[String],
    url: String,
    originalUrl: String,
    embedUrl: Option[String],
    height: Int,
    width: Int,
    role: Role,
) extends PageElement
object VideoVimeoBlockElement {
  implicit val VideoVimeoElementWrites: Writes[VideoVimeoBlockElement] = Json.writes[VideoVimeoBlockElement]
}

case class VideoYoutubeBlockElement(
    caption: Option[String],
    url: String,
    originalUrl: String,
    embedUrl: Option[String],
    height: Int,
    width: Int,
    role: Role,
) extends PageElement
object VideoYoutubeBlockElement {
  implicit val VideoYoutubeBlockElementWrites: Writes[VideoYoutubeBlockElement] = Json.writes[VideoYoutubeBlockElement]
}

case class VineBlockElement(html: Option[String]) extends PageElement
object VineBlockElement {
  implicit val VideoYoutubeBlockElementWrites: Writes[VineBlockElement] = Json.writes[VineBlockElement]
}

case class WitnessBlockElement(html: Option[String]) extends PageElement
object WitnessBlockElement {
  implicit val WitnessBlockElementWrites: Writes[WitnessBlockElement] = Json.writes[WitnessBlockElement]
}

case class YoutubeBlockElement(
    id: String,
    assetId: String,
    channelId: Option[String],
    mediaTitle: String,
    overrideImage: Option[String],
    posterImage: Seq[NSImage1],
    expired: Boolean,
    duration: Option[Long],
) extends PageElement
/*
  The difference between `overrideImage` and `posterImage`

  When the `YoutubeBlockElement` is in main media position then `overrideImage` is set to the main media image.
  The reasons is:
    Since moving to Atoms, the multimedia team have commented that they're reluctant to use videos
    in main media as it makes the content look stale. This is because an Atom only has 1 image. Before Atoms, it was
    possible to set a different image for a video on each use. This change is bringing that functionality back.
    source: https://github.com/guardian/frontend/pull/20637

  In all cases `posterImage` carries the video own images.
 */
object YoutubeBlockElement {
  implicit val YoutubeBlockElementWrites: Writes[YoutubeBlockElement] = Json.writes[YoutubeBlockElement]
}

// Intended for unstructured html that we can't model, typically rejected by consumers
case class HTMLFallbackBlockElement(html: String) extends PageElement
object HTMLFallbackBlockElement {
  implicit val HTMLBlockElementWrites: Writes[HTMLFallbackBlockElement] = Json.writes[HTMLFallbackBlockElement]
}

//noinspection ScalaStyle
object PageElement {

  def isSupported(element: PageElement): Boolean = {
    // remove unsupported elements. Cross-reference with dotcom-rendering supported elements.
    element match {
      case _: AudioBlockElement           => true
      case _: AudioAtomBlockElement       => true
      case _: BlockquoteBlockElement      => true
      case _: CalloutBlockElement         => true
      case _: ChartAtomBlockElement       => true
      case _: CommentBlockElement         => true
      case _: ContentAtomBlockElement     => true
      case _: DisclaimerBlockElement      => true
      case _: DocumentBlockElement        => true
      case _: EmbedBlockElement           => true
      case _: ExplainerAtomBlockElement   => true
      case _: GenericAtomBlockElement     => true
      case _: GuideAtomBlockElement       => true
      case _: GuVideoBlockElement         => true
      case _: ImageBlockElement           => true
      case _: InstagramBlockElement       => true
      case _: InteractiveAtomBlockElement => true
      case _: InteractiveBlockElement     => true
      case _: MapBlockElement             => true
      case _: MediaAtomBlockElement       => true
      case _: ProfileAtomBlockElement     => true
      case _: PullquoteBlockElement       => true
      case _: QABlockElement              => true
      case _: QuizAtomBlockElement        => true
      case _: RichLinkBlockElement        => true
      case _: SoundcloudBlockElement      => true
      case _: SpotifyBlockElement         => true
      case _: SubheadingBlockElement      => true
      case _: TextBlockElement            => true
      case _: TimelineBlockElement        => true
      case _: TweetBlockElement           => true
      case _: VideoBlockElement           => true
      case _: VideoFacebookBlockElement   => true
      case _: VideoVimeoBlockElement      => true
      case _: VideoYoutubeBlockElement    => true
      case _: YoutubeBlockElement         => true

      // TODO we should quick fail here for these rather than pointlessly go to DCR
      case table: TableBlockElement if table.isMandatory.exists(identity) => true
      case _: CodeBlockElement                                            => true // Currently will just fail over at DCR

      case _ => false
    }
  }

  def make(
      element: ApiBlockElement,
      addAffiliateLinks: Boolean,
      pageUrl: String,
      atoms: Iterable[Atom],
      isMainBlock: Boolean,
      isImmersive: Boolean,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
      overrideImage: Option[ImageElement],
  ): List[PageElement] = {
    def extractAtom: Option[Atom] =
      for {
        contentAtom <- element.contentAtomTypeData
        atom <- atoms.find(_.id == contentAtom.atomId)
      } yield atom

    element.`type` match {

      case Text =>
        for {
          block <- element.textTypeData.toList
          text <- block.html.toList
          element <- Cleaner.split(text)
        } yield {
          element match {
            case ("h2", heading)                  => SubheadingBlockElement(heading)
            case ("blockquote", blockquote)       => BlockquoteBlockElement(blockquote)
            case (_, para) if (addAffiliateLinks) => Cleaners.affiliateLinks(pageUrl)(TextBlockElement(para))
            case (_, para)                        => TextBlockElement(para)
          }
        }

      case Tweet => {
        (for {
          data <- element.tweetTypeData
          id <- data.id
          html <- data.html
          url <- data.originalUrl
        } yield {
          TweetBlockElement(html, url, id, element.assets.nonEmpty, Role(data.role))
        }).toList
      }

      case RichLink =>
        List(
          RichLinkBlockElement(
            element.richLinkTypeData.flatMap(_.originalUrl),
            element.richLinkTypeData.flatMap(_.linkText),
            element.richLinkTypeData.flatMap(_.linkPrefix),
            Role(element.richLinkTypeData.flatMap(_.role)),
            element.richLinkTypeData.flatMap(_.sponsorship).map(Sponsorship(_)),
          ),
        )

      case Image =>
        def ensureHTTPS(src: String): String = src.replace("http:", "https:")

        val imageAssets = element.assets.zipWithIndex
          .map { case (a, i) => ImageAsset.make(a, i) }

        val imageSources: Seq[ImageSource] = DotcomRenderingImageRoleWidthByBreakpointMapping.all.map {
          case (weighting, widths) =>
            val srcSet: Seq[SrcSet] = widths.breakpoints.flatMap { b =>
              Seq(
                ImgSrc.srcsetForBreakpoint(
                  b,
                  DotcomRenderingImageRoleWidthByBreakpointMapping.immersive.breakpoints,
                  maybeImageMedia = Some(ImageMedia(imageAssets)),
                ),
                ImgSrc.srcsetForBreakpoint(
                  b,
                  DotcomRenderingImageRoleWidthByBreakpointMapping.immersive.breakpoints,
                  maybeImageMedia = Some(ImageMedia(imageAssets)),
                  hidpi = true,
                ),
              )
            }.flatten
            // A few very old articles use non-https hosts, which won't render
            val httpsSrcSet = srcSet.map(set => set.copy(src = ensureHTTPS(set.src)))
            ImageSource(weighting, httpsSrcSet)
        }.toSeq

        // The default role is used when an image doesn't have one and is then meant to be Inline,
        // that having been said, there are exceptions to this rule.
        // For instance, if the page is immersive and the picture is `mainMedia` and the image
        // doesn't have a role, then the role should be Immersive, thereby overriding the default Inline
        val defaultRole = (isMainBlock, isImmersive) match {
          case (true, true) => Immersive
          case _            => Inline
        }

        List(
          ImageBlockElement(
            ImageMedia(imageAssets),
            imageDataFor(element),
            element.imageTypeData.flatMap(_.displayCredit),
            Role(element.imageTypeData.flatMap(_.role), defaultRole),
            imageSources,
          ),
        )

      case Audio => audioToPageElement(element).toList

      case Video => {
        def secureVideoHtmlUrls(html: String, element: ApiBlockElement): String = {
          /*
            Date: 04th September 2020
            author: Pascal

            Enhance HTML to process cases such as

            <video data-media-id=\"gu-video-457132757\" class=\"gu-video\" controls=\"controls\" poster=\"http://static.guim.co.uk/sys-images/Guardian/Pix/audio/video/2015/6/11/1434025823959/KP_270483_crop_640x360.jpg\">
              <source src=\"http://cdn.theguardian.tv/mainwebsite/2015/06/11/150611spacediary_desk.mp4\"/>
              <source src=\"http://cdn.theguardian.tv/3gp/small/2015/06/11/150611spacediary_small.3gp\"/>
              <source src=\"http://cdn.theguardian.tv/HLS/2015/06/11/150611spacediary.m3u8\"/>
              <source src=\"http://cdn.theguardian.tv/3gp/large/2015/06/11/150611spacediary_large.3gp\"/>
              <source src=\"http://cdn.theguardian.tv/webM/2015/06/11/150611spacediary_synd_768k_vp8.webm\"/>
            </video>

            Originally found at https://www.theguardian.com/books/2020/sep/02/top-10-books-about-space-travel-samantha-cristoforetti?dcr=false

            We need to replace the links by secure links.

            There are three ways to do this

              1. Replace "http:" by "https:" in the HTML string; but that's a bit dangerous.

              2. Replace "http://cdn.theguardian.tv" by "https://cdn.theguardian.tv"; but that's limiting

              3. Replace all the unsecured links by the secure ones. This is perfect but the problem is to list the (unsecured) links
                 To achieve that we capitalise on the fact that the links are listed in element.assets

            The outcome is

            <video data-media-id=\"gu-video-457132757\" class=\"gu-video\" controls=\"controls\" poster=\"http://static.guim.co.uk/sys-images/Guardian/Pix/audio/video/2015/6/11/1434025823959/KP_270483_crop_640x360.jpg\">
              <source src=\"https://cdn.theguardian.tv/mainwebsite/2015/06/11/150611spacediary_desk.mp4\"/>
              <source src=\"https://cdn.theguardian.tv/3gp/small/2015/06/11/150611spacediary_small.3gp\"/>
              <source src=\"https://cdn.theguardian.tv/HLS/2015/06/11/150611spacediary.m3u8\"/>
              <source src=\"https://cdn.theguardian.tv/3gp/large/2015/06/11/150611spacediary_large.3gp\"/>
              <source src=\"https://cdn.theguardian.tv/webM/2015/06/11/150611spacediary_synd_768k_vp8.webm\"/>
            </video>

           */

          element.assets.toList
            .foldLeft(html) { (h, asset) =>
              val url = asset.file.getOrElse("")
              h.replaceAll(url, url.replace("http:", "https:"))
            }
        }
        if (element.assets.nonEmpty) {
          List(
            GuVideoBlockElement(
              element.assets.map(VideoAsset.make),
              ImageMedia(element.assets.filter(_.mimeType.exists(_.startsWith("image"))).zipWithIndex.map {
                case (a, i) => ImageAsset.make(a, i)
              }),
              element.videoTypeData.flatMap(_.caption).getOrElse(""),
              element.videoTypeData.flatMap(_.url).getOrElse(""),
              element.videoTypeData.flatMap(_.originalUrl).getOrElse(""),
              secureVideoHtmlUrls(element.videoTypeData.flatMap(_.html).getOrElse(""), element),
              element.videoTypeData.flatMap(_.source).getOrElse(""),
              Role(element.videoTypeData.flatMap(_.role)),
            ),
          )
        } else videoToPageElement(element).toList
      }

      case Membership =>
        element.membershipTypeData
          .map(m =>
            MembershipBlockElement(
              m.originalUrl,
              m.linkText,
              m.linkPrefix,
              m.title,
              m.venue,
              m.location,
              m.identifier,
              m.image,
              m.price,
            ),
          )
          .toList

      case Comment =>
        (for {
          c <- element.commentTypeData
          html <- c.html
        } yield {
          CommentBlockElement(
            body = CommentCleaner.getBody(html),
            avatarURL = CommentCleaner.getAvatar(html),
            dateTime = CommentCleaner.getDateTime(html),
            permalink = c.originalUrl.getOrElse(""),
            profileURL = c.authorUrl.getOrElse(""),
            profileName = c.authorName.getOrElse(""),
          )
        }).toList

      case Embed => embedToPageElement(element, campaigns, calloutsUrl).toList
      // This process returns either:
      // 1. SoundcloudBlockElement
      // 2. EmbedBlockElement
      // 3. CalloutBlockElement

      case Contentatom =>
        (extractAtom match {

          case Some(audio: AudioAtom) => {
            Some(
              AudioAtomBlockElement(
                id = audio.id,
                kicker = audio.data.kicker,
                title = audio.atom.title,
                coverUrl = audio.data.coverUrl,
                trackUrl = audio.data.trackUrl,
                duration = audio.data.duration,
                contentId = audio.data.contentId,
              ),
            )
          }

          case Some(chart: ChartAtom) => {
            val encodedId = URLEncoder.encode(chart.id, "UTF-8")
            // chart.id is a uuid, so there is no real need to url-encode it but just to be safe
            Some(
              ChartAtomBlockElement(
                id = chart.id,
                url = s"${Configuration.ajax.url}/embed/atom/chart/$encodedId",
                html = chart.html, // This is atom.defaultHtml
                css = None, // hardcoded to None during experimental period
                js = None, // hardcoded to None during experimental period
              ),
            )
          }

          case Some(explainer: ExplainerAtom) => {
            Some(ExplainerAtomBlockElement(explainer.id, explainer.title, explainer.body))
          }

          case Some(guide: GuideAtom) => {
            val html = guide.data.items
              .map(item => s"${item.title.map(t => s"<p><strong>${t}</strong></p>").getOrElse("")}${item.body}")
              .mkString("")
            val items = guide.data.items.toList.map(item => GuideAtomBlockElementItem(item.title, item.body))
            Some(
              GuideAtomBlockElement(
                id = guide.id,
                label = guide.data.typeLabel.getOrElse("Quick Guide"),
                title = guide.atom.title.getOrElse(""),
                img = guide.image.flatMap(ImgSrc.getAmpImageUrl),
                html = html,
                items = items,
                credit = guide.credit.getOrElse(""),
              ),
            )
          }

          case Some(interactive: InteractiveAtom) => {
            val encodedId = URLEncoder.encode(interactive.id, "UTF-8")
            Some(
              InteractiveAtomBlockElement(
                id = interactive.id,
                url = s"${Configuration.ajax.url}/embed/atom/interactive/$encodedId",
                html = Some(interactive.html),
                css = Some(interactive.css),
                js = interactive.mainJS,
                placeholderUrl = interactive.placeholderUrl,
              ),
            )
          }

          case Some(mediaAtom: MediaAtom) => {
            println("mediaAtom")
            println(mediaAtom)
            val imageOverride = overrideImage.map(_.images).flatMap(Video700.bestSrcFor)
            val overrideImages = mediaAtom.posterImage match {
              case None             => Seq()
              case Some(imageCrops) => NSImage1.imageMediaToSequence(imageCrops)
            }
            mediaAtom match {
              case youtube if mediaAtom.assets.headOption.exists(_.platform == MediaAssetPlatform.Youtube) => {
                mediaAtom.activeAssets.headOption.map(asset => {
                  YoutubeBlockElement(
                    id = mediaAtom.id, // CAPI ID
                    assetId = asset.id, // Youtube ID
                    channelId = mediaAtom.channelId, // Channel ID
                    mediaTitle = mediaAtom.title, // Caption
                    overrideImage = if (isMainBlock) imageOverride else None,
                    posterImage = overrideImages,
                    expired = mediaAtom.expired.getOrElse(false),
                    duration = mediaAtom.duration, // Duration in seconds
                  )
                })
              }
              case _ =>
                Some(
                  MediaAtomBlockElement(
                    mediaAtom.id,
                    mediaAtom.title,
                    mediaAtom.defaultHtml,
                    mediaAtom.assets.map(MediaAtomBlockElementMediaAsset.fromMediaAsset),
                    mediaAtom.duration,
                    mediaAtom.posterImage.map(NSImage1.imageMediaToSequence),
                    mediaAtom.expired,
                    mediaAtom.activeVersion,
                    mediaAtom.channelId,
                  ),
                )
            }
          }

          case Some(profile: ProfileAtom) => {
            val html = profile.data.items
              .map(item => s"${item.title.map(t => s"<p><strong>${t}</strong></p>").getOrElse("")}${item.body}")
              .mkString("")
            val items = profile.data.items.toList.map(item => ProfileAtomBlockElementItem(item.title, item.body))
            Some(
              ProfileAtomBlockElement(
                id = profile.id,
                label = profile.data.typeLabel.getOrElse("Profile"),
                title = profile.atom.title.getOrElse(""),
                img = profile.image.flatMap(ImgSrc.getAmpImageUrl),
                html = html,
                items = items,
                credit = profile.credit.getOrElse(""),
              ),
            )
          }

          case Some(qa: QandaAtom) => {
            Some(
              QABlockElement(
                id = qa.id,
                title = qa.atom.title.getOrElse(""),
                img = qa.image.flatMap(ImgSrc.getAmpImageUrl),
                html = qa.data.item.body,
                credit = qa.credit.getOrElse(""),
              ),
            )
          }

          case Some(timeline: TimelineAtom) => {
            Some(
              TimelineBlockElement(
                id = timeline.id,
                title = timeline.atom.title.getOrElse(""),
                description = timeline.data.description,
                events = timeline.data.events.map(event =>
                  TimelineEvent(
                    title = event.title,
                    date = TimelineAtom.renderFormattedDate(event.date, event.dateFormat),
                    body = event.body,
                    toDate = event.toDate.map(date => TimelineAtom.renderFormattedDate(date, event.dateFormat)),
                  ),
                ),
              ),
            )
          }
          case Some(quizAtom: QuizAtom) =>
            Some(
              QuizAtomBlockElement(
                id = quizAtom.id,
                questions = quizAtom.content.questions.map { q =>
                  QuizAtomQuestion(
                    id = q.id,
                    text = q.text,
                    answers = q.answers.map(a =>
                      QuizAtomAnswer(
                        id = a.id,
                        text = a.text,
                        revealText = a.revealText,
                        isCorrect = a.weight == 1,
                      ),
                    ),
                    imageUrl = q.imageMedia.flatMap(i => ImgSrc.getAmpImageUrl(i.imageMedia)),
                  )
                },
              ),
            )

          // Here we capture all the atom types which are not yet supported.
          // ContentAtomBlockElement is mapped to null in the DCR source code.
          case Some(atom) => Some(ContentAtomBlockElement(atom.id))

          case _ => None
        }).toList

      case ElementType.Map => {
          for {
            mapElem <- element.mapTypeData
            originalUrl <- mapElem.originalUrl
            source <- mapElem.source
            html <- mapElem.html
            embedUrl <- getIframeSrc(html)
            width <- getIframeWidth(html)
            height <- getIframeHeight(html)
            caption = mapElem.caption.getOrElse("")
            title = mapElem.title.getOrElse("")
          } yield MapBlockElement(embedUrl, originalUrl, source, caption, title, width, height)
        }.toList

      case Pullquote =>
        element.pullquoteTypeData.map(d => PullquoteBlockElement(d.html, Role(d.role), d.attribution)).toList
      case Interactive =>
        element.interactiveTypeData.flatMap(_.iframeUrl).map(url => InteractiveBlockElement(url)).toList
      case Table   => element.tableTypeData.map(d => TableBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Witness => element.witnessTypeData.map(d => WitnessBlockElement(d.html)).toList
      case Document =>
        element.documentTypeData
          .map(d => DocumentBlockElement(getEmbedUrl(d.html), d.width, d.height, d.title, d.isMandatory))
          .toList
      case Instagram =>
        element.instagramTypeData.map(d => InstagramBlockElement(d.originalUrl, d.html, d.caption.isDefined)).toList
      case Vine => element.vineTypeData.map(d => VineBlockElement(d.html)).toList
      case Code =>
        List(CodeBlockElement(None, true)) // Force isMandatory to avoid rendering any articles with Codeblocks in AMP
      case Form                      => List(FormBlockElement(None))
      case EnumUnknownElementType(f) => List(UnknownBlockElement(None))
      case _                         => Nil
    }
  }

  private[this] def getIframeSrc(html: String): Option[String] = {
    val doc = Jsoup.parseBodyFragment(html)
    doc.getElementsByTag("iframe").asScala.headOption.map(_.attr("src"))
  }

  private[this] def getIframeWidth(html: String): Option[Int] = {
    val doc = Jsoup.parseBodyFragment(html)
    doc.getElementsByTag("iframe").asScala.headOption.map(_.attr("width").toInt)
  }

  private[this] def getIframeHeight(html: String): Option[Int] = {
    val doc = Jsoup.parseBodyFragment(html)
    doc.getElementsByTag("iframe").asScala.headOption.map(_.attr("height").toInt)
  }

  private def extractSoundcloudBlockElement(html: String, isMandatory: Boolean): Option[SoundcloudBlockElement] = {
    val src = getIframeSrc(html)
    src.flatMap { s =>
      (SoundcloudHelper.getTrackIdFromUrl(s), SoundcloudHelper.getPlaylistIdFromUrl(s)) match {
        case (Some(track), _)    => Some(SoundcloudBlockElement(html, track, isTrack = true, isMandatory))
        case (_, Some(playlist)) => Some(SoundcloudBlockElement(html, playlist, isTrack = false, isMandatory))
        case _                   => None
      }
    }
  }

  private def extractChartDatawrapperEmbedBlockElement(html: String): Option[EmbedBlockElement] = {
    // This only returns an EmbedBlockELement if referring to a charts-datawrapper.s3.amazonaws.com
    for {
      src <- getIframeSrc(html)
      if src.contains("charts-datawrapper.s3.amazonaws.com")
    } yield {
      EmbedBlockElement(html, None, None, false)
    }
  }

  private def extractGenericEmbedBlockElement(html: String): Option[EmbedBlockElement] = {
    // This returns a EmbedBlockELement to handle any iframe that wasn't captured by extractChartDatawrapperEmbedBlockElement
    for {
      src <- getIframeSrc(html)
    } yield {
      EmbedBlockElement(html, None, None, false)
    }
  }

  private def extractSpotifyBlockElement(element: ApiBlockElement): Option[SpotifyBlockElement] = {
    for {
      d <- element.audioTypeData
      html <- d.html
      src <- getIframeSrc(html)

      // Deciding if the source is Spotify. Note that we cannot rely on d.source due to lack of data integrity. Some
      // self described Spotify elements are actually charts-datawrapper.s3.amazonaws.com
      if src.contains("spotify.com")
    } yield {
      SpotifyBlockElement(getEmbedUrl(d.html), getIframeHeight(html), getIframeWidth(html), d.title, d.caption)
    }
  }

  private def audioToPageElement(element: ApiBlockElement) = {
    for {
      d <- element.audioTypeData
      html <- d.html
      mandatory = true
    } yield {
      /*
        comment id: 2e5ac4fd-e7f1-4c04-bdcd-ceadd2dc5d4c

        Audio is a versatile carrier. It carries both audio and, incorrectly, non audio (in legacy content).

        The audioToPageElement function performs the transformation of an Audio element to the appropriate
        PageElement.

        The function returns either:
           1. SoundcloudBlockElement
           2. SpotifyBlockElement
           3. EmbedBlockElement
           4. AudioBlockElement (currently: an error message)

        Note: EmbedBlockElement is returned by both extractChartDatawrapperEmbedBlockElement and extractGenericEmbedBlockElement
        The former catches charts from charts-datawrapper.s3.amazonaws.com while the latter captures any iframe.

        Note: AudioBlockElement is currently a catch all element which helps identify when Audio is carrying an incorrect
        payload. It was decided that handling those as they come up will be an ongoing health task of the dotcom team,
        and not part of the original DCR migration.
       */
      extractSoundcloudBlockElement(html, mandatory).getOrElse {
        extractSpotifyBlockElement(element).getOrElse {
          extractChartDatawrapperEmbedBlockElement(html).getOrElse {
            extractGenericEmbedBlockElement(html).getOrElse {
              // This version of AudioBlockElement is not currently supported in DCR
              // AudioBlockElement(element.assets.map(AudioAsset.make))

              // AudioBlockElement is currently a catch all element which helps identify when Audio is carrying an
              // incorrect payload.
              AudioBlockElement("This audio element cannot be displayed at this time")
            }
          }
        }
      }
    }
  }

  private def embedToPageElement(
      element: ApiBlockElement,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): Option[PageElement] = {
    for {
      d <- element.embedTypeData
      html <- d.html
      mandatory = d.isMandatory.getOrElse(false)
    } yield {
      extractSoundcloudBlockElement(html, mandatory).getOrElse {
        CalloutExtraction.extractCallout(html: String, campaigns, calloutsUrl).getOrElse {
          EmbedBlockElement(html, d.safeEmbedCode, d.alt, mandatory)
        }
      }
    }
  }

  private def imageDataFor(element: ApiBlockElement): Map[String, String] = {
    element.imageTypeData.map { d =>
      Map(
        "copyright" -> d.copyright,
        "alt" -> d.alt,
        "caption" -> d.caption,
        "credit" -> d.credit,
      ) collect { case (k, Some(v)) => (k, v) }
    } getOrElse Map()
  }

  private def getEmbedUrl(html: Option[String]): Option[String] = {
    html match {
      case Some(ht) => getIframeSrc(ht)
      case _        => None
    }
  }

  private def videoToPageElement(element: ApiBlockElement): Option[PageElement] = {
    for {
      data <- element.videoTypeData
      source <- data.source
      caption = data.caption
      originalUrl <- data.originalUrl
      height <- data.height
      width <- data.width
      url = data.url.getOrElse(originalUrl)
    } yield {
      source match {
        case "YouTube" =>
          VideoYoutubeBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case "Vimeo" =>
          VideoVimeoBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case "Facebook" =>
          VideoFacebookBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case _ => VideoBlockElement(caption, url, originalUrl, height, width, Role(data.role))
      }
    }

  }

  val pageElementWrites: Writes[PageElement] = Json.writes[PageElement]
}

// ------------------------------------------------------
// Misc.
// ------------------------------------------------------

object Cleaner {
  def split(html: String): List[(String, String)] = {
    Jsoup
      .parseBodyFragment(html)
      .body()
      .children()
      .asScala
      .toList
      .map(el => (el.tagName, el.outerHtml))
  }
}

object CommentCleaner {
  def getBody(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-body")
      .html()
  }

  def getAvatar(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-avatar")
      .attr("src")
  }

  def getDateTime(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-datetime")
      .html()
  }
}
