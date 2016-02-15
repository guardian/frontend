package model.liveblog

import com.gu.contentapi.client.model.v1.ElementType.{Text, Image, Audio, Video, Embed}
import com.gu.contentapi.client.model.v1.{BlockElement => ApiBlockElement, ImageElementFields}
import model.{ImageAsset, AudioAsset, VideoAsset}
import play.api.libs.json._

sealed trait BlockElement
case class TextBlockElement(html: Option[String]) extends BlockElement
case class ImageBlockElement(assets: Seq[ImageAsset], data: Map[String, String], displayCredit: Option[Boolean]) extends BlockElement
case class AudioBlockElement(assets: Seq[AudioAsset]) extends BlockElement
case class VideoBlockElement(assets: Seq[VideoAsset]) extends BlockElement
case class EmbedBlockElement(html: Option[String], safe: Option[Boolean], alt: Option[String]) extends BlockElement

object BlockElement {
  implicit object BlockElementFormat extends Format[Seq[BlockElement]] {
    def reads(json: JsValue): JsResult[Seq[BlockElement]] = JsSuccess(Seq.empty)
    def writes(els: Seq[BlockElement]) = JsArray(Seq(JsNull))
  }

  def make(element: ApiBlockElement): Option[BlockElement] = {
    element.`type` match {
      case Text => Some(TextBlockElement(element.textTypeData.flatMap(_.html)))
      case Image => Some(ImageBlockElement(
        element.assets.zipWithIndex.map { case (a, i) => ImageAsset.make(a, i) },
        element.imageTypeData.map { d => Map(
          "copyright" -> d.copyright,
          "alt" -> d.alt,
          "caption" -> d.caption,
          "credit" -> d.credit
        ) collect { case (k, Some(v)) => (k,v) }} getOrElse Map(),
        element.imageTypeData.flatMap(_.displayCredit)
      ))
      case Audio => Some(AudioBlockElement(element.assets.map(AudioAsset.make)))
      case Video => Some(VideoBlockElement(element.assets.map(VideoAsset.make)))
      case Embed => element.embedTypeData.map(d => EmbedBlockElement(d.html, d.safeEmbedCode, d.alt))
      case _ => None
    }
  }
}
