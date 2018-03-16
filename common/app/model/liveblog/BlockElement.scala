package model.liveblog

import com.gu.contentapi.client.model.v1.ElementType.{Map => _, _}
import com.gu.contentapi.client.model.v1.{SponsorshipType, BlockElement => ApiBlockElement, Sponsorship => ApiSponsorship}
import model.{AudioAsset, ImageAsset, ImageMedia, VideoAsset}
import play.api.libs.json._

sealed trait BlockElement
case class TextBlockElement(html: Option[String]) extends BlockElement
case class ImageBlockElement(media: ImageMedia, data: Map[String, String], displayCredit: Option[Boolean]) extends BlockElement
case class AudioBlockElement(assets: Seq[AudioAsset]) extends BlockElement
case class GuVideoBlockElement(assets: Seq[VideoAsset], imageMedia: ImageMedia, data: Map[String, String]) extends BlockElement
case class VideoBlockElement(data: Map[String, String]) extends BlockElement
case class EmbedBlockElement(html: Option[String], safe: Option[Boolean], alt: Option[String]) extends BlockElement
case class ContentAtomBlockElement(atomId: String) extends BlockElement

case class RichLinkBlockElement(
  url: Option[String],
  text: Option[String],
  prefix: Option[String],
  sponsorship: Option[Sponsorship]) extends BlockElement

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

object BlockElement {

  def make(element: ApiBlockElement): Option[BlockElement] = {
    element.`type` match {
      case Text => Some(TextBlockElement(element.textTypeData.flatMap(_.html)))

      case Tweet => Some(TextBlockElement(element.tweetTypeData.flatMap(_.html)))

      case RichLink => Some(RichLinkBlockElement(
        element.richLinkTypeData.flatMap(_.originalUrl),
        element.richLinkTypeData.flatMap(_.linkText),
        element.richLinkTypeData.flatMap(_.linkPrefix),
        element.richLinkTypeData.flatMap(_.sponsorship).map(Sponsorship(_))
      ))

      case Image => Some(ImageBlockElement(
        ImageMedia(element.assets.zipWithIndex.map { case (a, i) => ImageAsset.make(a, i) }),
        imageDataFor(element),
        element.imageTypeData.flatMap(_.displayCredit)
      ))

      case Audio => Some(AudioBlockElement(element.assets.map(AudioAsset.make)))

      case Video =>
        if (element.assets.nonEmpty) {
          Some(GuVideoBlockElement(
            element.assets.map(VideoAsset.make),
            ImageMedia(element.assets.filter(_.mimeType.exists(_.startsWith("image"))).zipWithIndex.map {
              case (a, i) => ImageAsset.make(a, i)
            }),
            videoDataFor(element))
          )
        }

        else Some(VideoBlockElement(videoDataFor(element)))

      case Embed => element.embedTypeData.map(d => EmbedBlockElement(d.html, d.safeEmbedCode, d.alt))

      case Contentatom => element.contentAtomTypeData.map(d => ContentAtomBlockElement(d.atomId))

      case _ => None
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

  implicit val textBlockElementWrites: Writes[TextBlockElement] = Json.writes[TextBlockElement]
  implicit val ImageBlockElementWrites: Writes[ImageBlockElement] = Json.writes[ImageBlockElement]
  implicit val AudioBlockElementWrites: Writes[AudioBlockElement] = Json.writes[AudioBlockElement]
  implicit val GuVideoBlockElementWrites: Writes[GuVideoBlockElement] = Json.writes[GuVideoBlockElement]
  implicit val VideoBlockElementWrites: Writes[VideoBlockElement] = Json.writes[VideoBlockElement]
  implicit val EmbedBlockElementWrites: Writes[EmbedBlockElement] = Json.writes[EmbedBlockElement]
  implicit val ContentAtomBlockElementWrites: Writes[ContentAtomBlockElement] = Json.writes[ContentAtomBlockElement]
  implicit val SponsorshipWrites: Writes[Sponsorship] = new Writes[Sponsorship] {
    def writes(sponsorship: Sponsorship): JsObject = Json.obj(
      "sponsorName" -> sponsorship.sponsorName,
      "sponsorLogo" -> sponsorship.sponsorLogo,
      "sponsorLink" -> sponsorship.sponsorLink,
      "sponsorshipType" -> sponsorship.sponsorshipType.name)
  }
  implicit val RichLinkBlockElementWrites: Writes[RichLinkBlockElement] = Json.writes[RichLinkBlockElement]
  val blockElementWrites: Writes[BlockElement] = Json.writes[BlockElement]
}
