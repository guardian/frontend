package model

object FaciaDisplayElement {
  def fromTrail(trail: Trail) = {
    (trail, trail.mainVideo) match {
      case (other: Content, Some(videoElement)) if other.showMainVideo =>
        InlineVideo(videoElement, other.webTitle, EndSlateComponents.fromContent(other).toUriPath)
      case _ => InlineImage
    }
  }

  def isVideo(trail: Trail) = fromTrail(trail) match {
    case _: InlineVideo => true
    case _ => false
  }
}

sealed trait FaciaDisplayElement

case class InlineVideo(videoElement: VideoElement, title: String, endSlatePath: String) extends FaciaDisplayElement
case object InlineImage extends FaciaDisplayElement
