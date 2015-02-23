package views.support

import model.{FaciaImageElement, Trail}

object CutOut {
  def fromTrail(trail: Trail): Option[CutOut] = {
    if (trail.imageCutoutReplace) {
      trail.customImageCutout map {
        case FaciaImageElement(src, width, height) => CutOut(src, Orientation.fromDimensions(width, height))
      } orElse {
        /** We're assuming here that standard contributor images from CAPI are in landscape, as unfortunately they
          * do not come with dimensions attached.
          */
        if (trail.contributors.length == 1) {
          for {
            contributor <- trail.contributors.find(_.contributorLargeImagePath.isDefined)
            imagePath <- contributor.contributorLargeImagePath
          } yield CutOut(imagePath, Landscape)
        } else {
          None
        }
      }
    } else {
      None
    }
  }
}

object Orientation {
  def fromDimensions(width: Int, height: Int) = if (width > height) Landscape else Portrait
}

sealed trait Orientation

case object Landscape extends Orientation
case object Portrait extends Orientation

case class CutOut(imageUrl: String, orientation: Orientation) {
  def cssClass = orientation match {
    case Landscape => "image--landscape"
    case Portrait => "image--portrait"
  }
}
