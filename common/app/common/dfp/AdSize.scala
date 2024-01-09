package common.dfp

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class AdSize(width: Int, height: Int)

object AdSize {

  implicit val writes: Writes[AdSize] = (size: AdSize) => {
    Json.obj(
      "width" -> size.width,
      "height" -> size.height,
    )
  }

  implicit val reads: Reads[AdSize] = (
    (JsPath \ "width").read[Int] and
      (JsPath \ "height").read[Int]
  )(AdSize.apply _)

  val invisibleSize: AdSize = AdSize(1, 1)

  val leaderboardSize: AdSize = AdSize(728, 90)

  val responsiveSize: AdSize = AdSize(88, 70)

  val billboardSize: AdSize = AdSize(970, 250)
}
