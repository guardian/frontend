package model.liveblog

import com.gu.contentapi.client.model.v1.ElementType.{Map => _, _}
import com.gu.contentapi.client.model.v1.{BlockElement => ApiBlockElement}
import model.{AudioAsset, ImageAsset, ImageMedia, VideoAsset}
import play.api.libs.json._

sealed trait BlockElement
case class TextBlockElement(html: Option[String]) extends BlockElement
case class ImageBlockElement(media: ImageMedia, data: Map[String, String], displayCredit: Option[Boolean]) extends BlockElement
case class AudioBlockElement(assets: Seq[AudioAsset]) extends BlockElement
case class GuVideoBlockElement(assets: Seq[VideoAsset], imageMedia: ImageMedia, data: Map[String, String]) extends BlockElement
case class VideoBlockElement(data: Map[String, String]) extends BlockElement
case class EmbedBlockElement(html: Option[String], safe: Option[Boolean], alt: Option[String]) extends BlockElement
case class RichLinkBlockElement(url: Option[String], text: Option[String], prefix: Option[String]) extends BlockElement

object BlockElement {

  implicit object BlockElementFormat extends Format[Seq[BlockElement]] {
    def reads(json: JsValue): JsResult[Seq[BlockElement]] = JsSuccess(Seq.empty)
    def writes(els: Seq[BlockElement]) = JsArray(Seq(JsNull))
  }

  def make(element: ApiBlockElement): Option[BlockElement] = {
    element.`type` match {
      case Text => Some(TextBlockElement(element.textTypeData.flatMap(_.html)))

      case Tweet => Some(TextBlockElement(element.tweetTypeData.flatMap(_.html)))

      case RichLink => Some(RichLinkBlockElement(
        element.richLinkTypeData.flatMap(_.originalUrl),
        element.richLinkTypeData.flatMap(_.linkText),
        element.richLinkTypeData.flatMap(_.linkPrefix)
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
}
