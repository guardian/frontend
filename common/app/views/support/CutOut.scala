package views.support

import common.GuLogging
import model.pressed.{PressedContent, Cutout}

import scala.util.{Failure, Success, Try}

sealed trait Orientation
case object Landscape extends Orientation
case object Portrait extends Orientation

object Orientation {
  def fromDimensions(width: Int, height: Int): Orientation = if (width >= height) Landscape else Portrait
}

case class CutOut(imageUrl: String, orientation: Orientation)

object CutOut extends GuLogging {
  /* If a CutOut comes with width and height, it's proabably coming from facia-tool
     Otherwise, it is probably coming from Content API Content type via tags (This gives no src and width)
   */
  def fromTrail(faciaContent: PressedContent): Option[CutOut] = {
    faciaContent.properties.image match {
      case Some(Cutout(src, Some(width), Some(height))) =>
        Try((width.toInt, height.toInt)) match {
          case Success((w, h)) => Option(CutOut(src, Orientation.fromDimensions(w, h)))
          case Failure(t)      =>
            log.warn(s"Could not convert width and height to INT: $t")
            None
        }
      case Some(Cutout(src, _, _)) => Option(CutOut(src, Landscape))
      case _                       => None
    }
  }

  def cssClass(orientation: Orientation): String = {
    orientation match {
      case Landscape => "image--landscape"
      case Portrait  => "image--portrait"
    }
  }
}
