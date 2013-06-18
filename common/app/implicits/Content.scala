package implicits

import model.Gallery
import model.{ Content => ModelContent }

trait Content {

  implicit class MaybeGallery(c: ModelContent) {

    lazy val maybeGallery = c match {
      case g: Gallery => Some(g)
      case _ => None
    }

  }
}
