package views.support

import com.gu.facia.api.models.{FaciaContent, Cutout}
import common.Logging
import implicits.FaciaContentImplicits._

import scala.util.{Failure, Success, Try}

object CutOut extends Logging {
  /* If a CutOut comes with width and height, it's proabably coming from facia-tool
     Otherwise, it is probably coming from Content API Content type via tags (This gives no src and width)
   */
  def fromTrail(faciaContent: FaciaContent): Option[CutOut] = {
    faciaContent.image match {
      case Some(Cutout(src, Some(width), Some(height))) =>
        Try((width.toInt, height.toInt)) match {
          case Success((w, h)) => Option(CutOut(src, Orientation.fromDimensions(w, h)))
          case Failure(t) =>
            log.warn(s"Could not convert width and height to INT: $t")
            None}
      case Some(Cutout(src, _, _)) => Option(CutOut(src, Landscape))
      case _ => None}
  }
}

object Orientation {
  def fromDimensions(width: Int, height: Int) = if (width >= height) Landscape else Portrait
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
