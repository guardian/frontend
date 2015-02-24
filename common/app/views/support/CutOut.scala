package views.support

import com.gu.facia.api.models.{ImageCutout, FaciaContent}
import common.Logging
import model.{Tag, FaciaImageElement}
import implicits.FaciaContentImplicits._

import scala.util.{Failure, Success, Try}

object CutOut extends Logging {
  /* If a CutOut comes with width and height, it's proabably coming from facia-tool
     Otherwise, it is probably coming from Content API Content type via tags (This gives no src and width)
   */
  def fromTrail(faciaContent: FaciaContent): Option[CutOut] = {
    faciaContent.imageCutout match {
        case Some(ImageCutout(imageCutoutSrc, Some(imageCutoutSrcHeight), Some(imageCutoutSrcWidth))) =>
          Try((imageCutoutSrcWidth.toInt, imageCutoutSrcHeight.toInt)) match {
            case Success((width, height)) => Option(CutOut(imageCutoutSrc, Orientation.fromDimensions(width, height)))
            case Failure(t) =>
              log.warn(s"Could not convert width and height to INT: $t")
              None
          }
        case Some(ImageCutout(imageCutoutSrc, _, _)) => Option(CutOut(imageCutoutSrc, Landscape))
        case _ => None
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
