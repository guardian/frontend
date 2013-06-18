package implicits

import model.{ Gallery, Content }

trait ContentImplicits {

  implicit class MaybeGallery(c: Content) {

    lazy val maybeGallery = c match {
      case g: Gallery => Some(g)
      case _ => None
    }

  }
}
