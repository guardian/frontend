package model

import com.gu.facia.api.models.FaciaContent
import conf.Switches
import implicits.FaciaContentImplicits._

object FaciaDisplayElement {
  def fromTrail(faciaContent: FaciaContent): Option[FaciaDisplayElement] = {
    (faciaContent, faciaContent.mainVideo) match {
      case (other, Some(videoElement)) if other.showMainVideo =>
        Some(InlineVideo(
          videoElement,
          other.webTitle,
          EndSlateComponents.fromFaciaContent(other).toUriPath,
          InlineImage.fromFaciaContent(faciaContent)
        ))
      case (content: Content, _) if content.isCrossword && Switches.CrosswordSvgThumbnailsSwitch.isSwitchedOn =>
        Some(CrosswordSvg(content.id))
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
  def fromFaciaContent(faciaContent: FaciaContent): Option[InlineImage] =
    if (!faciaContent.imageHide) {
      faciaContent.trailPicture(5, 3) map { picture =>
        InlineImage(picture)
      }
    } else {
      None
    }
}

case class InlineImage(imageContainer: ImageContainer) extends FaciaDisplayElement

case class CrosswordSvg(id: String) extends FaciaDisplayElement {
  def persistenceId = id.stripPrefix("crosswords/")

  def imageUrl = s"/$id.svg"
}
