package implicits

import play.api.libs.functional.syntax._
import play.api.libs.json._
import model.R2PressMessage

trait R2PressNotification {
  implicit val pressMessageFormatter: Format[R2PressMessage] = (
    (__ \ "url").format[String] and
      (__ \ "convertToHttps").format[Boolean]
  )(R2PressMessage.apply, unlift(R2PressMessage.unapply))
}

object R2PressNotification extends R2PressNotification
