package model

import conf.Configuration
import conf.switches.Switches
import implicits.FaciaContentFrontendHelpers._
import layout.ItemClasses
import model.pressed.PressedContent

object FaciaDisplayElement {
  def fromFaciaContentAndCardType(faciaContent: PressedContent, itemClasses: ItemClasses): Option[FaciaDisplayElement] = {
    faciaContent.mainVideo match {
      case Some(videoElement) if faciaContent.properties.showMainVideo =>
        Some(InlineVideo(
          videoElement,
          faciaContent.properties.webTitle,
          EndSlateComponents.fromFaciaContent(faciaContent).toUriPath,
          InlineImage.fromFaciaContent(faciaContent)
        ))
      case _ if faciaContent.properties.isCrossword && Switches.CrosswordSvgThumbnailsSwitch.isSwitchedOn =>
        faciaContent.properties.maybeContentId map CrosswordSvg
      case _ if faciaContent.properties.imageSlideshowReplace && itemClasses.canShowSlideshow =>
        InlineSlideshow.fromFaciaContent(faciaContent)
      case _ => InlineImage.fromFaciaContent(faciaContent)
    }
  }
}

sealed trait FaciaDisplayElement

case class InlineVideo(
  videoElement: VideoElement,
  title: String,
  endSlatePath: String,
  fallBack: Option[InlineImage]
) extends FaciaDisplayElement

object InlineImage {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineImage] =
    if (!faciaContent.properties.imageHide) {
      faciaContent.trailPicture(5, 3) map { picture =>
        InlineImage(picture)
      }
    } else {
      None
    }
}

case class InlineImage(imageContainer: Element) extends FaciaDisplayElement

case class CrosswordSvg(id: String) extends FaciaDisplayElement {
  def persistenceId = id.stripPrefix("crosswords/")

  def imageUrl = s"${Configuration.ajax.url}/$id.svg"
}

object InlineSlideshow {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineSlideshow] =
    for (s <- faciaContent.slideshow) yield InlineSlideshow(s)
}

case class InlineSlideshow(images: Iterable[FaciaImageElement]) extends FaciaDisplayElement
