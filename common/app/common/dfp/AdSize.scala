package common.dfp

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class AdSize(width: Int, height: Int)

object AdSize {

  implicit val writes = new Writes[AdSize] {
    def writes(size: AdSize): JsValue = {
      Json.obj(
        "width" -> size.width,
        "height" -> size.height
      )
    }
  }

  implicit val reads: Reads[AdSize] = (
    (JsPath \ "width").read[Int] and
      (JsPath \ "height").read[Int]
    )(AdSize.apply _)

  val invisibleSize = AdSize(1, 1)

  val leaderboardSize = AdSize(728, 90)

  val responsiveSize = AdSize(88, 70)

  val billboardSize = AdSize(970, 250)
}
