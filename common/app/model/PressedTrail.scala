package model.pressed

import model.{ImageMedia}
import org.joda.time.DateTime

final case class PressedTrail(
  trailPicture: Option[ImageMedia],
  byline: Option[String],
  thumbnailPath: Option[String],
  webPublicationDate: DateTime
)

