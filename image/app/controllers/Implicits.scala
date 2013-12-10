package controllers

import implicits._
import java.awt.image.BufferedImage
import org.imgscalr.Scalr

trait Implicits extends Numbers
    with Images
    with Strings
    with WSResponse {

  implicit class image2Resize(image: BufferedImage) {
    def resize(width: Int, height: Int) = Scalr.resize(image,
      Scalr.Method.SPEED,
      width, height,
      Scalr.OP_ANTIALIAS
    )
  }
}
