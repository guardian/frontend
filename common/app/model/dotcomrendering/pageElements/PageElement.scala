package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.ElementType.{Map => _, _}
import com.gu.contentapi.client.model.v1.{ElementType, SponsorshipType, BlockElement => ApiBlockElement, Sponsorship => ApiSponsorship}
import layout.ContentWidths.BodyMedia
import model.content._
import model.{AudioAsset, ImageAsset, ImageMedia, VideoAsset}
import org.jsoup.Jsoup
import play.api.libs.json._
import views.support.cleaner.AmpSoundcloud
import views.support.{AffiliateLinksCleaner, ImgSrc, Item120, Item1200, Item140, Item300, Item640, Item700, SrcSet}

import scala.collection.JavaConverters._

/*
  These elements are used for the Dotcom Rendering, they are essentially the new version of the
  model.liveblog._ elements but replaced in full here
 */

sealed trait PageElement
case class TextBlockElement(html: String) extends PageElement
case class SubheadingBlockElement(html: String) extends PageElement
case class TweetBlockElement(html: String, url: String, id: String, hasMedia: Boolean, role: Role) extends PageElement
case class PullquoteBlockElement(html: Option[String], role: Role) extends PageElement
case class ImageBlockElement(media: ImageMedia, data: Map[String, String], displayCredit: Option[Boolean], role: Role, imageSources: Seq[ImageSource]) extends PageElement
case class ImageSource(weighting: String, srcSet: Seq[SrcSet])
case class AudioBlockElement(assets: Seq[AudioAsset]) extends PageElement
case class GuVideoBlockElement(assets: Seq[VideoAsset], imageMedia: ImageMedia, data: Map[String, String], role: Role) extends PageElement
case class VideoBlockElement(data: Map[String, String], role: Role) extends PageElement
case class EmbedBlockElement(html: String, safe: Option[Boolean], alt: Option[String], isMandatory: Boolean) extends PageElement
case class SoundcloudBlockElement(html: String, id: String, isTrack: Boolean, isMandatory: Boolean) extends PageElement
case class ContentAtomBlockElement(atomId: String) extends PageElement
case class YoutubeBlockElement(id: String, assetId: String, channelId: Option[String], mediaTitle: String) extends PageElement
case class InteractiveBlockElement(html: Option[String], role: Role, isMandatory: Option[Boolean]) extends PageElement
case class CommentBlockElement(body: String, avatarURL: String, profileURL: String, profileName: String, permalink: String, dateTime: String) extends PageElement
case class TableBlockElement(html: Option[String], role: Role, isMandatory: Option[Boolean]) extends PageElement
case class WitnessBlockElement(html: Option[String]) extends PageElement
case class DocumentBlockElement(html: Option[String], role: Role, isMandatory: Option[Boolean]) extends PageElement
case class InstagramBlockElement(url: String, html: Option[String], hasCaption: Boolean) extends PageElement
case class VineBlockElement(html: Option[String]) extends PageElement
case class MapBlockElement(html: Option[String],  role: Role, isMandatory: Option[Boolean]) extends PageElement
case class UnknownBlockElement(html: Option[String]) extends PageElement
case class DisclaimerBlockElement(html: String) extends PageElement

// atoms

// TODO dates are being rendered as strings to avoid duplication of the
//  to-string logic, but ultimately we should pass unformatted date info to
//  DCR.
case class TimelineEvent(
  title: String,
  date: String,
  body: Option[String],
  toDate: Option[String]
)


// TODO include img alt, width, and height in model
case class TimelineBlockElement(id: String, title: String, description: Option[String], events: Seq[TimelineEvent]) extends PageElement

case class QABlockElement(id: String, title: String, img: Option[String], html: String, credit: String) extends PageElement
case class GuideBlockElement(id: String, title: String, img: Option[String], html: String, credit: String) extends PageElement
case class ProfileBlockElement(id: String, title: String, img: Option[String], html: String, credit: String) extends PageElement

case class MembershipBlockElement(
  originalUrl: Option[String],
  linkText: Option[String],
  linkPrefix: Option[String],
  title: Option[String],
  venue: Option[String],
  location: Option[String],
  identifier: Option[String],
  image: Option[String],
  price: Option[String]
) extends PageElement

// these don't appear to have typeData on the capi models so we just have empty html
case class CodeBlockElement(html: Option[String]) extends PageElement
case class FormBlockElement(html: Option[String]) extends PageElement

case class RichLinkBlockElement(
  url: Option[String],
  text: Option[String],
  prefix: Option[String],
  role: Role,
  sponsorship: Option[Sponsorship]
) extends PageElement

case class Sponsorship (
  sponsorName: String,
  sponsorLogo: String,
  sponsorLink: String,
  sponsorshipType: SponsorshipType
)

object Sponsorship {
  def apply(sponsorship: ApiSponsorship): Sponsorship = {
    Sponsorship(
      sponsorship.sponsorName,
      sponsorship.sponsorLogo,
      sponsorship.sponsorLink,
      sponsorship.sponsorshipType
    )
  }
}

//noinspection ScalaStyle
object PageElement {
  val dotComponentsImageProfiles = List(Item1200, Item700, Item640, Item300, Item140, Item120)

  def make(element: ApiBlockElement, addAffiliateLinks: Boolean, pageUrl: String, atoms: Iterable[Atom]): List[PageElement] = {
    def extractAtom: Option[Atom] = for {
      contentAtom <- element.contentAtomTypeData
      atom <- atoms.find(_.id == contentAtom.atomId)
    } yield atom

    element.`type` match {

      case Text => for {
        block <- element.textTypeData.toList
        text <- block.html.toList
        element <- Cleaner.split(text)
      } yield { element match {
        case ("h2", heading) => SubheadingBlockElement(heading)
        case (_ , para) if (addAffiliateLinks) => AffiliateLinksCleaner.replaceLinksInElement(para, pageUrl = pageUrl, contentType = "article")
        case (_, para) => TextBlockElement(para)
        }
      }

      case Tweet => {
        (for {
          data <- element.tweetTypeData
            id <- data.id
          html <- data.html
          url <- data.originalUrl
        } yield {
          TweetBlockElement( html,url,id, element.assets.nonEmpty, Role(data.role))
        }).toList
      }

      case RichLink => List(RichLinkBlockElement(
        element.richLinkTypeData.flatMap(_.originalUrl),
        element.richLinkTypeData.flatMap(_.linkText),
        element.richLinkTypeData.flatMap(_.linkPrefix),
        Role(element.richLinkTypeData.flatMap(_.role)),
        element.richLinkTypeData.flatMap(_.sponsorship).map(Sponsorship(_))
      ))

      case Image =>
        val signedAssets = element.assets.zipWithIndex
          .map { case (a, i) => ImageAsset.make(a, i) }
        val imageSources: Seq[ImageSource] = BodyMedia.all.map {
          case (weighting, widths) =>
            val srcSet = widths.breakpoints.flatMap { b =>
              ImgSrc.srcsetForBreakpoint(b, BodyMedia.inline.breakpoints, maybeImageMedia = Some(ImageMedia(signedAssets)))
            }
            ImageSource(weighting, srcSet)
        }.toSeq

        List(ImageBlockElement(
          ImageMedia(signedAssets),
          imageDataFor(element),
          element.imageTypeData.flatMap(_.displayCredit),
          Role(element.imageTypeData.flatMap(_.role)),
          imageSources
        ))

      case Audio => extractAudio(element).toList

      case Video =>
        if (element.assets.nonEmpty) {
          List(GuVideoBlockElement(
            element.assets.map(VideoAsset.make),
            ImageMedia(element.assets.filter(_.mimeType.exists(_.startsWith("image"))).zipWithIndex.map {
              case (a, i) => ImageAsset.make(a, i)
            }),
            videoDataFor(element),
            Role(element.videoTypeData.flatMap(_.role)))
          )
        }
        else List(VideoBlockElement(videoDataFor(element), Role(element.videoTypeData.flatMap(_.role))))

      case Membership => element.membershipTypeData.map(m => MembershipBlockElement(
        m.originalUrl,
        m.linkText,
        m.linkPrefix,
        m.title,
        m.venue,
        m.location,
        m.identifier,
        m.image,
        m.price
      )).toList

      case Comment => (for {
        c <- element.commentTypeData
        html <- c.html
      } yield {
        CommentBlockElement(
          body = CommentCleaner.getBody(html),
          avatarURL = CommentCleaner.getAvatar(html),
          dateTime = CommentCleaner.getDateTime(html),
          permalink = c.originalUrl.getOrElse(""),
          profileURL = c.authorUrl.getOrElse(""),
          profileName = c.authorName.getOrElse("")
        )
      }).toList

      case Embed => extractEmbed(element).toList

      case Contentatom =>
        (extractAtom match {
          case Some(mediaAtom: MediaAtom) => {
            mediaAtom.activeAssets.headOption.map(asset => {
              YoutubeBlockElement(
                mediaAtom.id, //CAPI ID
                asset.id, // Youtube ID
                mediaAtom.channelId, //Channel ID
                mediaAtom.title //Caption
              )
            })
          }

          case Some(qa: QandaAtom) => {
            Some(QABlockElement(
              id = qa.id,
              title = qa.atom.title.getOrElse(""),
              img = qa.image.flatMap(ImgSrc.getAmpImageUrl),
              html = qa.data.item.body,
              credit = qa.credit.getOrElse("")
            ))
          }

          case Some(guide: GuideAtom) => {
            Some(ProfileBlockElement(
              id = guide.id,
              title = guide.atom.title.getOrElse(""),
              img = guide.image.flatMap(ImgSrc.getAmpImageUrl),
              html = guide.data.items.map(_.body).mkString(""),
              credit = guide.credit.getOrElse("")
            ))
          }

          case Some(profile: ProfileAtom) => {
            Some(ProfileBlockElement(
              id = profile.id,
              title = profile.atom.title.getOrElse(""),
              img = profile.image.flatMap(ImgSrc.getAmpImageUrl),
              html = profile.data.items.map(_.body).mkString(""),
              credit = profile.credit.getOrElse("")
            ))
          }

          case Some(timeline: TimelineAtom) => {
            Some(TimelineBlockElement(
              id = timeline.id,
              title = timeline.atom.title.getOrElse(""),
              description = timeline.data.description,
              events = timeline.data.events.map(event => TimelineEvent(
                title = event.title,
                date = TimelineAtom.renderFormattedDate(event.date, event.dateFormat),
                body = event.body,
                toDate = event.toDate.map(date => TimelineAtom.renderFormattedDate(date, event.dateFormat)),
              )),
            ))
          }

          case Some(atom) =>
            Some(ContentAtomBlockElement(atom.id))
          case _ => None
        }).toList

      case Pullquote => element.pullquoteTypeData.map(d => PullquoteBlockElement(d.html, Role(None))).toList
      case Interactive => element.interactiveTypeData.map(d => InteractiveBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Table => element.tableTypeData.map(d => TableBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Witness => element.witnessTypeData.map(d => WitnessBlockElement(d.html)).toList
      case Document => element.documentTypeData.map(d => DocumentBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Instagram => element.instagramTypeData.map(d => InstagramBlockElement(d.originalUrl, d.html, d.caption.isDefined)).toList
      case Vine => element.vineTypeData.map(d => VineBlockElement(d.html)).toList
      case ElementType.Map => element.mapTypeData.map(d => MapBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Code => List(CodeBlockElement(None))
      case Form => List(FormBlockElement(None))
      case EnumUnknownElementType(f) => List(UnknownBlockElement(None))
    }
  }

  private def extractAudio(element: ApiBlockElement) = {
    for {
      d <- element.audioTypeData
      html <- d.html
      mandatory = true
    } yield {
      extractSoundcloud(html, mandatory) getOrElse AudioBlockElement(element.assets.map(AudioAsset.make))
    }
  }

  private def extractEmbed(element: ApiBlockElement): Option[PageElement] = {
    for {
      d <- element.embedTypeData
      html <- d.html
      mandatory = d.isMandatory.getOrElse(false)
    } yield {
      extractSoundcloud(html, mandatory) getOrElse EmbedBlockElement(html, d.safeEmbedCode, d.alt, mandatory)
    }
  }

  private def extractSoundcloud(html: String, isMandatory: Boolean): Option[SoundcloudBlockElement] = {

    val doc = Jsoup.parseBodyFragment(html)
    doc.getElementsByTag("iframe").asScala.headOption.flatMap {
      iframe =>
        val src = iframe.attr("src")
        (AmpSoundcloud.getTrackIdFromUrl(src), AmpSoundcloud.getPlaylistIdFromUrl(src)) match {
          case (Some(track), _) => Some(SoundcloudBlockElement(html, track, isTrack = true, isMandatory))
          case (_, Some(playlist)) => Some(SoundcloudBlockElement(html, playlist, isTrack = false, isMandatory))
          case _ => None
        }
    }
  }

  private def imageDataFor(element: ApiBlockElement): Map[String, String] = {
    element.imageTypeData.map { d => Map(
      "copyright" -> d.copyright,
      "alt" -> d.alt,
      "caption" -> d.caption,
      "credit" -> d.credit
    ) collect { case (k, Some(v)) => (k, v) }
    } getOrElse Map()
  }

  private def videoDataFor(element: ApiBlockElement): Map[String, String] = {
    element.videoTypeData.map { d => Map(
      "caption" -> d.caption,
      "url" -> d.url
    ) collect { case (k, Some (v) ) => (k, v) }
    } getOrElse Map()
  }

  implicit val imageWeightingWrites: Writes[ImageSource] = Json.writes[ImageSource]
  implicit val textBlockElementWrites: Writes[TextBlockElement] = Json.writes[TextBlockElement]
  implicit val subheadingBlockElementWrites: Writes[SubheadingBlockElement] = Json.writes[SubheadingBlockElement]
  implicit val ImageBlockElementWrites: Writes[ImageBlockElement] = Json.writes[ImageBlockElement]
  implicit val AudioBlockElementWrites: Writes[AudioBlockElement] = Json.writes[AudioBlockElement]
  implicit val GuVideoBlockElementWrites: Writes[GuVideoBlockElement] = Json.writes[GuVideoBlockElement]
  implicit val VideoBlockElementWrites: Writes[VideoBlockElement] = Json.writes[VideoBlockElement]
  implicit val TweetBlockElementWrites: Writes[TweetBlockElement] = Json.writes[TweetBlockElement]
  implicit val EmbedBlockElementWrites: Writes[EmbedBlockElement] = Json.writes[EmbedBlockElement]
  implicit val SoundCloudBlockElementWrites: Writes[SoundcloudBlockElement] = Json.writes[SoundcloudBlockElement]
  implicit val ContentAtomBlockElementWrites: Writes[ContentAtomBlockElement] = Json.writes[ContentAtomBlockElement]
  implicit val YoutubeBlockElementWrites: Writes[YoutubeBlockElement] = Json.writes[YoutubeBlockElement]
  implicit val PullquoteBlockElementWrites: Writes[PullquoteBlockElement] = Json.writes[PullquoteBlockElement]
  implicit val InteractiveBlockElementWrites: Writes[InteractiveBlockElement] = Json.writes[InteractiveBlockElement]
  implicit val CommentBlockElementWrites: Writes[CommentBlockElement] = Json.writes[CommentBlockElement]
  implicit val TableBlockElementWrites: Writes[TableBlockElement] = Json.writes[TableBlockElement]
  implicit val WitnessBlockElementWrites: Writes[WitnessBlockElement] = Json.writes[WitnessBlockElement]
  implicit val DocumentBlockElementWrites: Writes[DocumentBlockElement] = Json.writes[DocumentBlockElement]
  implicit val InstagramBlockElementWrites: Writes[InstagramBlockElement] = Json.writes[InstagramBlockElement]
  implicit val VineBlockElementWrites: Writes[VineBlockElement] = Json.writes[VineBlockElement]
  implicit val MapBlockElementWrites: Writes[MapBlockElement] = Json.writes[MapBlockElement]
  implicit val CodeBlockElementWrites: Writes[CodeBlockElement] = Json.writes[CodeBlockElement]
  implicit val MembershipBlockElementWrites: Writes[MembershipBlockElement] = Json.writes[MembershipBlockElement]
  implicit val FormBlockElementWrites: Writes[FormBlockElement] = Json.writes[FormBlockElement]
  implicit val UnknownBlockElementWrites: Writes[UnknownBlockElement] = Json.writes[UnknownBlockElement]
  implicit val DiscalimerBlockElementWrites: Writes[DisclaimerBlockElement] = Json.writes[DisclaimerBlockElement]

  // atoms
  implicit val TimelineEventWrites = Json.writes[TimelineEvent]
  implicit val TimelineBlockElementWrites = Json.writes[TimelineBlockElement]
  implicit val QABlockElementWrites = Json.writes[QABlockElement]
  implicit val GuideBlocklementWrites = Json.writes[GuideBlockElement]
  implicit val profileBlockElementWrites = Json.writes[ProfileBlockElement]

  implicit val SponsorshipWrites: Writes[Sponsorship] = new Writes[Sponsorship] {
    def writes(sponsorship: Sponsorship): JsObject = Json.obj(
      "sponsorName" -> sponsorship.sponsorName,
      "sponsorLogo" -> sponsorship.sponsorLogo,
      "sponsorLink" -> sponsorship.sponsorLink,
      "sponsorshipType" -> sponsorship.sponsorshipType.name)
  }

  implicit val RichLinkBlockElementWrites: Writes[RichLinkBlockElement] = Json.writes[RichLinkBlockElement]
  val blockElementWrites: Writes[PageElement] = Json.writes[PageElement]

}

object Cleaner{
  def split(html: String):List[(String, String)] = {
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
