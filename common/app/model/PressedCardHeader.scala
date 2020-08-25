package model.pressed

import com.gu.contentapi.client.model.v1.{ElementType}
import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi, utils => fapiutils}
import model.{SupportedUrl}

final case class PressedCardHeader(
    isVideo: Boolean,
    isComment: Boolean,
    isGallery: Boolean,
    isAudio: Boolean,
    kicker: Option[ItemKicker],
    seriesOrBlogKicker: Option[TagKicker],
    headline: String,
    url: String,
    hasMainVideoElement: Option[Boolean],
)

object PressedCardHeader {
  def make(content: fapi.FaciaContent): PressedCardHeader = {
    val capiContent = FaciaContentUtils.maybeContent(content)
    PressedCardHeader(
      kicker = FaciaContentUtils.itemKicker(content).map(ItemKicker.make),
      headline = FaciaContentUtils.headline(content),
      isVideo = FaciaContentUtils.isVideo(content),
      isComment = FaciaContentUtils.isComment(content),
      isAudio = FaciaContentUtils.isAudio(content),
      isGallery = FaciaContentUtils.isGallery(content),
      seriesOrBlogKicker =
        capiContent.flatMap(item => fapiutils.ItemKicker.seriesOrBlogKicker(item).map(ItemKicker.makeTagKicker)),
      url = capiContent.map(SupportedUrl(_)).getOrElse(FaciaContentUtils.id(content)),
      hasMainVideoElement = Some(
        capiContent.flatMap(_.elements).exists(_.exists(e => e.`type` == ElementType.Video && e.relation == "main")),
      ),
    )
  }
}
