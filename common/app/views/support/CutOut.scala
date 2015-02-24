package views.support

import com.gu.facia.api.models.{ImageCutout, FaciaContent}
import common.Logging
import model.{Tag, FaciaImageElement}
import implicits.FaciaContentImplicits._

import scala.util.{Failure, Success, Try}

object CutOut extends Logging {
  def fromTrail(faciaContent: FaciaContent): Option[CutOut] = {
    (faciaContent.imageCutout match {
        case Some(ImageCutout(imageCutoutSrc, Some(imageCutoutSrcHeight), Some(imageCutoutSrcWidth))) =>
          Try(FaciaImageElement(imageCutoutSrc, imageCutoutSrcWidth.toInt, imageCutoutSrcHeight.toInt)) match {
            case Success(faciaImageElement) => Option(faciaImageElement)
            case Failure(t) =>
              log.warn(s"Could not convert width and height to INT: $t")
              None
          }
        case _ => None
      })
      .map {
        case FaciaImageElement(src, width, height) => CutOut(src, Orientation.fromDimensions(width, height))
      } orElse {
        //TODO: Get rid of this, logic exists in facia-scala-client
        /** We're assuming here that standard contributor images from CAPI are in landscape, as unfortunately they
          * do not come with dimensions attached.
          */
        if (faciaContent.contributors.length == 1) {
          for {
            contributor <- faciaContent.contributors.map(Tag.apply(_)).find(_.contributorLargeImagePath.isDefined)
            imagePath <- contributor.contributorLargeImagePath
          } yield CutOut(imagePath, Landscape)
        } else {
          None
        }
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
