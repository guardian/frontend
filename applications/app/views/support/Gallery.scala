package views.support

import model.ImageAsset

object Gallery {

  def boundingBox(images: Seq[ImageAsset]): (Int, Int) =
    (images.map(_.width).max, images.map(_.height).max)

}
