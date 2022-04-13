package model

import conf.Configuration
import conf.switches.Switches
import implicits.FaciaContentFrontendHelpers._
import layout.ItemClasses
import model.pressed.PressedContent
import model.content.MediaAtom

object FaciaDisplayElement {
  def fromFaciaContentAndCardType(
      faciaContent: PressedContent,
      itemClasses: ItemClasses,
  ): Option[FaciaDisplayElement] = {
    faciaContent.mainVideo match {
      case Some(videoElement) if faciaContent.properties.showMainVideo =>
        Some(
          InlineVideo(
            videoElement,
            faciaContent.properties.webTitle,
            InlineImage.fromFaciaContent(faciaContent),
          ),
        )
      case _ if faciaContent.properties.isCrossword && Switches.CrosswordSvgThumbnailsSwitch.isSwitchedOn =>
        faciaContent.properties.maybeContentId map CrosswordSvg
      case _ if faciaContent.properties.imageSlideshowReplace && itemClasses.canShowSlideshow =>
        InlineSlideshow.fromFaciaContent(faciaContent)
      case _ if faciaContent.properties.showMainVideo && faciaContent.mainYouTubeMediaAtom.isDefined =>
        Some(InlineYouTubeMediaAtom(faciaContent.mainYouTubeMediaAtom.get, faciaContent.trailPicture))
      case _ => InlineImage.fromFaciaContent(faciaContent)
    }
  }
}

sealed trait FaciaDisplayElement

case class InlineVideo(
    videoElement: VideoElement,
    title: String,
    fallBack: Option[InlineImage],
) extends FaciaDisplayElement

case class InlineYouTubeMediaAtom(youTubeAtom: MediaAtom, posterImageOverride: Option[ImageMedia])
    extends FaciaDisplayElement

object InlineImage {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineImage] =
    if (!faciaContent.display.imageHide) {
      faciaContent.trailPicture map { picture =>
        InlineImage(picture)
      }
    } else {
      None
    }
}

case class InlineImage(imageMedia: ImageMedia) extends FaciaDisplayElement

case class CrosswordSvg(id: String) extends FaciaDisplayElement {
  def persistenceId: String = id.stripPrefix("crosswords/")

  def imageUrl: String = s"${Configuration.ajax.url}/$id.svg"
}

object InlineSlideshow {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineSlideshow] =
    for (s <- faciaContent.slideshow) yield InlineSlideshow(s)
}

case class InlineSlideshow(images: Iterable[FaciaImageElement]) extends FaciaDisplayElement
