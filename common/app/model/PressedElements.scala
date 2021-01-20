package model.pressed

import model.content.{MediaAtom}
import model.{VideoElement}

final case class PressedElements(
    mainVideo: Option[VideoElement],
    mediaAtoms: Seq[MediaAtom],
)
