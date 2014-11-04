package model

object FaciaDisplayElement {
  def fromTrail(trail: Trail): Option[FaciaDisplayElement] = {
    (trail, trail.mainVideo) match {
      case (other: Content, Some(videoElement)) if other.showMainVideo =>
        Some(InlineVideo(
          videoElement,
          other.webTitle,
          EndSlateComponents.fromContent(other).toUriPath,
          InlineImage.fromTrail(trail)
        ))
      case (content: Content, _) if content.isCrossword =>
        Some(CrosswordSvg(content.id))
      case _ => InlineImage.fromTrail(trail)
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
  def fromTrail(trail: Trail): Option[InlineImage] = if (!trail.imageHide) {
    trail.trailPicture(5, 3) map { picture =>
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
