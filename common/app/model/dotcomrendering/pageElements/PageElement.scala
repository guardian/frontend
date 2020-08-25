package model.dotcomrendering.pageElements

import java.net.{URLEncoder}

import com.gu.contentapi.client.model.v1.ElementType.{Map => _, _}
import com.gu.contentapi.client.model.v1.{ElementType, SponsorshipType, BlockElement => ApiBlockElement, Sponsorship => ApiSponsorship}
import conf.Configuration
import layout.ContentWidths.{DotcomRenderingImageRoleWidthByBreakpointMapping}
import model.content._
import model.{AudioAsset, ImageAsset, ImageMedia, VideoAsset}
import org.jsoup.Jsoup
import play.api.libs.json._
import views.support.cleaner.SoundcloudHelper
import views.support.{AffiliateLinksCleaner, ImgSrc, SrcSet}

import scala.collection.JavaConverters._

// TODO dates are being rendered as strings to avoid duplication of the
// to-string logic, but ultimately we should pass unformatted date info to
// DCR.
case class TimelineEvent(
  title: String,
  date: String,
  body: Option[String],
  toDate: Option[String]
)

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

// ------------------------------------------------------
// PageElement
// ------------------------------------------------------

/*
  These elements are used for the Dotcom Rendering, they are essentially the new version of the
  model.liveblog._ elements but replaced in full here
 */

sealed trait PageElement

case class AudioAtomBlockElement(id: String, kicker: String, coverUrl: String, trackUrl: String, duration: Int, contentId: String) extends PageElement
case class AudioBlockElement(assets: Seq[AudioAsset]) extends PageElement
case class BlockquoteBlockElement(html: String) extends PageElement
case class ExplainerAtomBlockElement(id: String, title: String, body: String) extends PageElement
case class CalloutBlockElement(id: String, calloutsUrl: Option[String], activeFrom: Long, displayOnSensitive: Boolean, formId: Int, title: String, description: String, tagName: String, formFields: List[CalloutFormField]) extends PageElement
case class ChartAtomBlockElement(id: String, url: String) extends PageElement
case class CodeBlockElement(html: Option[String], isMandatory: Boolean) extends PageElement
case class CommentBlockElement(body: String, avatarURL: String, profileURL: String, profileName: String, permalink: String, dateTime: String) extends PageElement
case class ContentAtomBlockElement(atomId: String) extends PageElement
case class DocumentBlockElement(embedUrl: Option[String], height: Option[Int], width: Option[Int], title: Option[String], isMandatory: Option[Boolean]) extends PageElement
case class DisclaimerBlockElement(html: String) extends PageElement
case class EmbedBlockElement(html: String, safe: Option[Boolean], alt: Option[String], isMandatory: Boolean) extends PageElement
case class FormBlockElement(html: Option[String]) extends PageElement
case class GenericAtomBlockElement(id: String, url: String, html: Option[String], css: Option[String], js: Option[String]) extends PageElement
           // GenericAtomBlockElement is the only BlockElement, despite following the Atom BlockElement naming convention, that doesn't correspond to a single atom type.
           // We use it to carry to DCR atoms that do not (yet) have their on dedicated BlockElement and are rendered in DCR as iframes.
           //     - {url} for src
           //     - {html, css, js} for srcdoc

case class GuideAtomBlockElementItem(title: Option[String], body: String)
object GuideAtomBlockElementItem {
  implicit val GuideAtomBlockElementItemWrites: Writes[GuideAtomBlockElementItem] = Json.writes[GuideAtomBlockElementItem]
}
case class GuideAtomBlockElement(id: String, label: String, title: String, img: Option[String], html: String, items: List[GuideAtomBlockElementItem], credit: String) extends PageElement

case class GuVideoBlockElement(assets: Seq[VideoAsset], imageMedia: ImageMedia, caption:String, url:String, originalUrl:String, role: Role) extends PageElement
case class ImageBlockElement(media: ImageMedia, data: Map[String, String], displayCredit: Option[Boolean], role: Role, imageSources: Seq[ImageSource]) extends PageElement
case class ImageSource(weighting: String, srcSet: Seq[SrcSet])
case class InteractiveAtomBlockElement(id: String, url: String, html: Option[String], css: Option[String], js: Option[String]) extends PageElement
case class InteractiveBlockElement(url: String) extends PageElement
case class InstagramBlockElement(url: String, html: Option[String], hasCaption: Boolean) extends PageElement
case class MapBlockElement(url: String, originalUrl: String, source: String, caption: String, title: String) extends PageElement
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

case class ProfileAtomBlockElementItem(title: Option[String], body: String)
object ProfileAtomBlockElementItem {
  implicit val GuideAtomBlockElementItemWrites: Writes[ProfileAtomBlockElementItem] = Json.writes[ProfileAtomBlockElementItem]
}
case class ProfileAtomBlockElement(id: String, label: String, title: String, img: Option[String], html: String, items: List[ProfileAtomBlockElementItem], credit: String) extends PageElement

case class PullquoteBlockElement(html: Option[String], role: Role, attribution: Option[String]) extends PageElement
case class QABlockElement(id: String, title: String, img: Option[String], html: String, credit: String) extends PageElement
case class RichLinkBlockElement(url: Option[String], text: Option[String], prefix: Option[String], role: Role, sponsorship: Option[Sponsorship]) extends PageElement
case class SoundcloudBlockElement(html: String, id: String, isTrack: Boolean, isMandatory: Boolean) extends PageElement
case class SpotifyBlockElement(embedUrl: Option[String], height: Option[Int], width: Option[Int], title: Option[String], caption: Option[String]) extends PageElement
case class SubheadingBlockElement(html: String) extends PageElement
case class TableBlockElement(html: Option[String], role: Role, isMandatory: Option[Boolean]) extends PageElement
case class TextBlockElement(html: String) extends PageElement
case class TimelineBlockElement(id: String, title: String, description: Option[String], events: Seq[TimelineEvent]) extends PageElement
case class TweetBlockElement(html: String, url: String, id: String, hasMedia: Boolean, role: Role) extends PageElement
case class UnknownBlockElement(html: Option[String]) extends PageElement
case class VideoBlockElement(caption: Option[String], url: String, originalUrl: String, height: Int, width: Int, role: Role) extends PageElement
case class VideoFacebookBlockElement(caption: Option[String], url: String, originalUrl: String, embedUrl: Option[String], height: Int, width: Int, role: Role) extends PageElement
case class VideoVimeoBlockElement(caption: Option[String], url: String, originalUrl: String, embedUrl: Option[String], height: Int, width: Int, role: Role) extends PageElement
case class VideoYoutubeBlockElement(caption: Option[String], url: String, originalUrl: String, embedUrl: Option[String], height: Int, width: Int, role: Role) extends PageElement
case class VineBlockElement(html: Option[String]) extends PageElement
case class WitnessBlockElement(html: Option[String]) extends PageElement
case class YoutubeBlockElement(id: String, assetId: String, channelId: Option[String], mediaTitle: String) extends PageElement

// Intended for unstructured html that we can't model, typically rejected by consumers
case class HTMLFallbackBlockElement(html: String) extends PageElement

//noinspection ScalaStyle
object PageElement {

  def isSupported(element: PageElement): Boolean = {
    // remove unsupported elements. Cross-reference with dotcom-rendering supported elements.
    element match {
      case _: AudioBlockElement => true
      case _: AudioAtomBlockElement => true
      case _: BlockquoteBlockElement => true
      case _: CalloutBlockElement => true
      case _: ChartAtomBlockElement => true
      case _: CommentBlockElement => true
      case _: ContentAtomBlockElement => true
      case _: DisclaimerBlockElement => true
      case _: DocumentBlockElement => true
      case _: EmbedBlockElement => true
      case _: ExplainerAtomBlockElement => true
      case _: GenericAtomBlockElement => true
      case _: GuideAtomBlockElement => true
      case _: GuVideoBlockElement => true
      case _: ImageBlockElement => true
      case _: InstagramBlockElement => true
      case _: InteractiveAtomBlockElement => true
      case _: InteractiveBlockElement => true
      case _: MapBlockElement => true
      case _: ProfileAtomBlockElement => true
      case _: PullquoteBlockElement => true
      case _: QABlockElement => true
      case _: RichLinkBlockElement => true
      case _: SoundcloudBlockElement => true
      case _: SpotifyBlockElement => true
      case _: SubheadingBlockElement => true
      case _: TextBlockElement => true
      case _: TimelineBlockElement => true
      case _: TweetBlockElement => true
      case _: VideoBlockElement => true
      case _: VideoFacebookBlockElement => true
      case _: VideoVimeoBlockElement => true
      case _: VideoYoutubeBlockElement => true
      case _: YoutubeBlockElement => true

      // TODO we should quick fail here for these rather than pointlessly go to DCR
      case table: TableBlockElement if table.isMandatory.exists(identity) => true
      case _: CodeBlockElement => true // Currently will just fail over at DCR

      case _ => false
    }
  }

  def make(element: ApiBlockElement, addAffiliateLinks: Boolean, pageUrl: String, atoms: Iterable[Atom], isMainBlock: Boolean, isImmersive: Boolean, campaigns: Option[JsValue], calloutsUrl: Option[String]): List[PageElement] = {
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
        case ("blockquote", blockquote) => BlockquoteBlockElement(blockquote)
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

        def ensureHTTPS(src: String): String = src.replace("http:", "https:")

        val signedAssets = element.assets.zipWithIndex
          .map { case (a, i) => ImageAsset.make(a, i) }

        val imageSources: Seq[ImageSource] = DotcomRenderingImageRoleWidthByBreakpointMapping.all.map {
          case (weighting, widths) =>
            val srcSet: Seq[SrcSet] = widths.breakpoints.flatMap { b =>
              Seq(
                ImgSrc.srcsetForBreakpoint(b, DotcomRenderingImageRoleWidthByBreakpointMapping.immersive.breakpoints, maybeImageMedia = Some(ImageMedia(signedAssets))),
                ImgSrc.srcsetForBreakpoint(b, DotcomRenderingImageRoleWidthByBreakpointMapping.immersive.breakpoints, maybeImageMedia = Some(ImageMedia(signedAssets)), hidpi = true)
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
          case _ => Inline
        }

        List(ImageBlockElement(
          ImageMedia(signedAssets),
          imageDataFor(element),
          element.imageTypeData.flatMap(_.displayCredit),
          Role(element.imageTypeData.flatMap(_.role), defaultRole),
          imageSources
        ))

      case Audio => audioToPageElement(element).toList
          /*
            The AudioBlockElement is a versatile carrier. It carries both audio and non audio (in legacy content)

            The audioToPageElement function performs the transformation of an AudioBlockElement to the appropriate
            PageElement

            The function returns either:
            - SoundcloudBlockElement
            - AudioBlockElement
            - InteractiveBlockElement
            - AudioBlockElement (currently not supported in DCR)
           */


      case Video =>
        if (element.assets.nonEmpty) {
          List(GuVideoBlockElement(
            element.assets.map(VideoAsset.make),
            ImageMedia(element.assets.filter(_.mimeType.exists(_.startsWith("image"))).zipWithIndex.map {
              case (a, i) => ImageAsset.make(a, i)
            }),
            element.videoTypeData.flatMap(_.caption).getOrElse(""),
            element.videoTypeData.flatMap(_.url).getOrElse(""),
            element.videoTypeData.flatMap(_.originalUrl).getOrElse(""),
            Role(element.videoTypeData.flatMap(_.role)))
          )
        }
        else videoToPageElement(element).toList

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

      case Embed => embedToPageElement(element, campaigns, calloutsUrl).toList
                    // This process returns either:
                    // 1. SoundcloudBlockElement
                    // 2. EmbedBlockElement
                    // 3. CalloutBlockElement

      case Contentatom =>
        (extractAtom match {

          case Some(audio: AudioAtom) => {

            // Using the AudioAtomBlockElement:
            // Some(AudioAtomBlockElement(audio.id, audio.data.kicker, audio.data.coverUrl, audio.data.trackUrl, audio.data.duration, audio.data.contentId))

            // Using the GenericAtomBlockElement:
            // This will be rendered like an InteractiveAtom on DCR
            val encodedId = URLEncoder.encode(audio.id, "UTF-8") // chart.id is a uuid, so there is no real need
                                                                 // to url-encode it but just to be safe
            Some(GenericAtomBlockElement(
              id = audio.id,
              url = s"${Configuration.ajax.url}/embed/atom/audio/$encodedId",
              html = None,
              css = None,
              js = None
            ))

            // Using the AudioAtomBlockElement:
            Some(AudioAtomBlockElement(audio.id, audio.data.kicker, audio.data.coverUrl, audio.data.trackUrl, audio.data.duration, audio.data.contentId))
          }

          case Some(chart: ChartAtom) => {
            val encodedId = URLEncoder.encode(chart.id, "UTF-8")
            // chart.id is a uuid, so there is no real need to url-encode it but just to be safe
            Some(ChartAtomBlockElement(
              id = chart.id,
              url = s"${Configuration.ajax.url}/embed/atom/chart/$encodedId"
            ))
          }

          case Some(explainer: ExplainerAtom) => {
            Some(ExplainerAtomBlockElement(explainer.id, explainer.title, explainer.body))
          }

          case Some(guide: GuideAtom) => {
            val html = guide.data.items.map(item => s"${item.title.map( t => s"<p><strong>${t}</strong></p>" ).getOrElse("")}${item.body}").mkString("")
            val items = guide.data.items.toList.map(item => GuideAtomBlockElementItem(item.title, item.body))
            Some(GuideAtomBlockElement(
              id = guide.id,
              label = guide.data.typeLabel.getOrElse("Quick Guide") ,
              title = guide.atom.title.getOrElse(""),
              img = guide.image.flatMap(ImgSrc.getAmpImageUrl),
              html = html,
              items = items,
              credit = guide.credit.getOrElse("")
            ))
          }

          case Some(interactive: InteractiveAtom) => {
            val encodedId = URLEncoder.encode(interactive.id, "UTF-8")
            Some(InteractiveAtomBlockElement(
              id = interactive.id,
              url = s"${Configuration.ajax.url}/embed/atom/interactive/$encodedId",
              html = Some(interactive.html),
              css = Some(interactive.css),
              js = interactive.mainJS
            ))
          }

          case Some(mediaAtom: MediaAtom) => {
            mediaAtom match {
              case youtube if mediaAtom.assets.headOption.exists(_.platform == MediaAssetPlatform.Youtube) => {
                mediaAtom.activeAssets.headOption.map(asset => {
                  YoutubeBlockElement(
                    mediaAtom.id, //CAPI ID
                    asset.id, // Youtube ID
                    mediaAtom.channelId, //Channel ID
                    mediaAtom.title //Caption
                  )
                })
              }
              // TODO - handle self-hosted video case.
              case htmlBlob if mediaAtom.assets.nonEmpty => Some(HTMLFallbackBlockElement(mediaAtom.defaultHtml))
            }
          }

          case Some(profile: ProfileAtom) => {
            val html = profile.data.items.map(item => s"${item.title.map( t => s"<p><strong>${t}</strong></p>" ).getOrElse("")}${item.body}").mkString("")
            val items = profile.data.items.toList.map(item => ProfileAtomBlockElementItem(item.title, item.body))
            Some(ProfileAtomBlockElement(
              id = profile.id,
              label = profile.data.typeLabel.getOrElse("Profile"),
              title = profile.atom.title.getOrElse(""),
              img = profile.image.flatMap(ImgSrc.getAmpImageUrl),
              html = html,
              items = items,
              credit = profile.credit.getOrElse("")
            ))
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
          src <- getIframeSrc(html)

          caption = mapElem.caption.getOrElse("")
          title = mapElem.title.getOrElse("")
        } yield MapBlockElement(src, originalUrl, source, caption, title)
      }.toList

      case Pullquote => element.pullquoteTypeData.map(d => PullquoteBlockElement(d.html, Role(d.role), d.attribution)).toList
      case Interactive => element.interactiveTypeData.flatMap(_.iframeUrl).map(url => InteractiveBlockElement(url)).toList
      case Table => element.tableTypeData.map(d => TableBlockElement(d.html, Role(d.role), d.isMandatory)).toList
      case Witness => element.witnessTypeData.map(d => WitnessBlockElement(d.html)).toList
      case Document => element.documentTypeData.map(d => DocumentBlockElement(getEmbedUrl(d.html), d.width, d.height, d.title, d.isMandatory)).toList
      case Instagram => element.instagramTypeData.map(d => InstagramBlockElement(d.originalUrl, d.html, d.caption.isDefined)).toList
      case Vine => element.vineTypeData.map(d => VineBlockElement(d.html)).toList
      case Code => List(CodeBlockElement(None, true)) // Force isMandatory to avoid rendering any articles with Codeblocks in AMP
      case Form => List(FormBlockElement(None))
      case EnumUnknownElementType(f) => List(UnknownBlockElement(None))
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
        case (Some(track), _) => Some(SoundcloudBlockElement(html, track, isTrack = true, isMandatory))
        case (_, Some(playlist)) => Some(SoundcloudBlockElement(html, playlist, isTrack = false, isMandatory))
        case _ => None
      }
    }
  }

  private def extractChartInteractiveBlockElement(html: String): Option[InteractiveBlockElement] = {
    Some(InteractiveBlockElement("http://charts-datawrapper.s3.amazonaws.com/pKbAT/index.html"))
  }

  private def extractSpotifyBlockElement(element: ApiBlockElement): Option[SpotifyBlockElement] = {
    for {
      d <- element.audioTypeData
      html <- d.html
      source <- d.source
      if source == "Spotify" // We rely on the `source` field to decide whether or not this is an instance of Spotify
    } yield {
      SpotifyBlockElement(getEmbedUrl(d.html), getIframeHeight(html), getIframeWidth(html), d.title, d.caption)
    }
  }

  def audioIsDCRSupported(element: ApiBlockElement): Boolean = {
    /*
      date: July 21th 2020 (updated 03rd August 2020)
      author: Pascal

      This function was introduced to be able to know from the article picker whether or not
      an AudioBlockElement given to the article picker's function "hasOnlySupportedElements" would
      resolve to a SoundcloudBlockElement or a SpotifyBlockElement (which we currently support in DCR)
      or an AudioBlockElement (which DCR doesn't yet support).

      See: 783a70d0-f6f2-43ab-a302-f4a12ba03aa0
     */
    println("->")
    println(element)
    println(audioToPageElement(element: ApiBlockElement))

    audioToPageElement(element: ApiBlockElement) match {
      case Some(_: SoundcloudBlockElement) => true
      case Some(_: SpotifyBlockElement) => true
      case _ => false
    }
  }

  private def audioToPageElement(element: ApiBlockElement) = {
    for {
      d <- element.audioTypeData
      html <- d.html
      mandatory = true
    } yield {
        extractSoundcloudBlockElement(html, mandatory).getOrElse {
          extractSpotifyBlockElement(element).getOrElse {
            extractChartInteractiveBlockElement("").getOrElse {
              AudioBlockElement(element.assets.map(AudioAsset.make))
            }
          }
        }
    }
  }

  private def embedToPageElement(element: ApiBlockElement, campaigns: Option[JsValue], calloutsUrl: Option[String]): Option[PageElement] = {
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
    element.imageTypeData.map { d => Map(
      "copyright" -> d.copyright,
      "alt" -> d.alt,
      "caption" -> d.caption,
      "credit" -> d.credit
    ) collect { case (k, Some(v)) => (k, v) }
    } getOrElse Map()
  }

  private def getEmbedUrl(html: Option[String]): Option[String] = {
    html match {
      case Some(ht) => getIframeSrc(ht)
      case _ => None
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
        case "YouTube" => VideoYoutubeBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case "Vimeo" => VideoVimeoBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case "Facebook" => VideoFacebookBlockElement(caption, url, originalUrl, getEmbedUrl(data.html), height, width, Role(data.role))
        case _ => VideoBlockElement(caption, url, originalUrl, height, width, Role(data.role))
      }
    }

  }

  // Below alphabetical order (modulo two exceptions)

  implicit val AudioBlockElementWrites: Writes[AudioBlockElement] = Json.writes[AudioBlockElement]
  implicit val AudioAtomBlockElementWrites: Writes[AudioAtomBlockElement] = Json.writes[AudioAtomBlockElement]
  implicit val BlockquoteBlockElementWrites: Writes[BlockquoteBlockElement] = Json.writes[BlockquoteBlockElement]
  implicit val CalloutBlockElementWrites: Writes[CalloutBlockElement] = Json.writes[CalloutBlockElement]
  implicit val ChartAtomBlockElementWrites: Writes[ChartAtomBlockElement] = Json.writes[ChartAtomBlockElement]
  implicit val CodeBlockElementWrites: Writes[CodeBlockElement] = Json.writes[CodeBlockElement]
  implicit val CommentBlockElementWrites: Writes[CommentBlockElement] = Json.writes[CommentBlockElement]
  implicit val ContentAtomBlockElementWrites: Writes[ContentAtomBlockElement] = Json.writes[ContentAtomBlockElement]
  implicit val DisclaimerBlockElementWrites: Writes[DisclaimerBlockElement] = Json.writes[DisclaimerBlockElement]
  implicit val DocumentBlockElementWrites: Writes[DocumentBlockElement] = Json.writes[DocumentBlockElement]
  implicit val EmbedBlockElementWrites: Writes[EmbedBlockElement] = Json.writes[EmbedBlockElement]
  implicit val ExplainerAtomBlockElementWrites: Writes[ExplainerAtomBlockElement] = Json.writes[ExplainerAtomBlockElement]
  implicit val FormBlockElementWrites: Writes[FormBlockElement] = Json.writes[FormBlockElement]
  implicit val GenericAtomBlockElementWrites: Writes[GenericAtomBlockElement] = Json.writes[GenericAtomBlockElement]
  implicit val GuideBlockElementWrites = Json.writes[GuideAtomBlockElement]
  implicit val GuVideoBlockElementWrites: Writes[GuVideoBlockElement] = Json.writes[GuVideoBlockElement]
  implicit val HTMLBlockElementWrites: Writes[HTMLFallbackBlockElement] = Json.writes[HTMLFallbackBlockElement]
  implicit val ImageWeightingWrites: Writes[ImageSource] = Json.writes[ImageSource]
  implicit val ImageBlockElementWrites: Writes[ImageBlockElement] = Json.writes[ImageBlockElement]
  implicit val InstagramBlockElementWrites: Writes[InstagramBlockElement] = Json.writes[InstagramBlockElement]
  implicit val InteractiveAtomBlockElementWrites: Writes[InteractiveAtomBlockElement] = Json.writes[InteractiveAtomBlockElement]
  implicit val InteractiveBlockElementWrites: Writes[InteractiveBlockElement] = Json.writes[InteractiveBlockElement]
  implicit val MapBlockElementWrites: Writes[MapBlockElement] = Json.writes[MapBlockElement]
  implicit val MembershipBlockElementWrites: Writes[MembershipBlockElement] = Json.writes[MembershipBlockElement]
  implicit val ProfileBlockElementWrites = Json.writes[ProfileAtomBlockElement]
  implicit val PullquoteBlockElementWrites: Writes[PullquoteBlockElement] = Json.writes[PullquoteBlockElement]
  implicit val QABlockElementWrites = Json.writes[QABlockElement]
  implicit val SoundCloudBlockElementWrites: Writes[SoundcloudBlockElement] = Json.writes[SoundcloudBlockElement]
  implicit val SponsorshipWrites: Writes[Sponsorship] = new Writes[Sponsorship] {
    def writes(sponsorship: Sponsorship): JsObject = Json.obj(
      "sponsorName" -> sponsorship.sponsorName,
      "sponsorLogo" -> sponsorship.sponsorLogo,
      "sponsorLink" -> sponsorship.sponsorLink,
      "sponsorshipType" -> sponsorship.sponsorshipType.name)
  }
  implicit val SpotifyBlockElementWrites: Writes[SpotifyBlockElement] = Json.writes[SpotifyBlockElement]
  implicit val RichLinkBlockElementWrites: Writes[RichLinkBlockElement] = Json.writes[RichLinkBlockElement]
  implicit val SubheadingBlockElementWrites: Writes[SubheadingBlockElement] = Json.writes[SubheadingBlockElement]
  implicit val TableBlockElementWrites: Writes[TableBlockElement] = Json.writes[TableBlockElement]
  implicit val TextBlockElementWrites: Writes[TextBlockElement] = Json.writes[TextBlockElement]
  implicit val TweetBlockElementWrites: Writes[TweetBlockElement] = Json.writes[TweetBlockElement]
  implicit val TimelineEventWrites = Json.writes[TimelineEvent]
  implicit val UnknownBlockElementWrites: Writes[UnknownBlockElement] = Json.writes[UnknownBlockElement]
  implicit val VideoBlockElementWrites: Writes[VideoBlockElement] = Json.writes[VideoBlockElement]
  implicit val VideoFacebookBlockElementWrites: Writes[VideoFacebookBlockElement] = Json.writes[VideoFacebookBlockElement]
  implicit val VideoVimeoElementWrites: Writes[VideoVimeoBlockElement] = Json.writes[VideoVimeoBlockElement]
  implicit val VideoYouTubeElementWrites: Writes[VideoYoutubeBlockElement] = Json.writes[VideoYoutubeBlockElement]
  implicit val VineBlockElementWrites: Writes[VineBlockElement] = Json.writes[VineBlockElement]
  implicit val WitnessBlockElementWrites: Writes[WitnessBlockElement] = Json.writes[WitnessBlockElement]
  implicit val YoutubeBlockElementWrites: Writes[YoutubeBlockElement] = Json.writes[YoutubeBlockElement]
  implicit val TimelineBlockElementWrites = Json.writes[TimelineBlockElement]

  val blockElementWrites: Writes[PageElement] = Json.writes[PageElement]

}

// ------------------------------------------------------
// Misc.
// ------------------------------------------------------

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
