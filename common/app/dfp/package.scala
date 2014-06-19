import play.api.libs.functional.syntax._
import play.api.libs.json._

package object dfp {

  implicit val sponsorshipReads: Reads[Sponsorship] = (
    (__ \ "tags").read[Seq[String]] and
    (__ \ "sponsor").readNullable[String]
  )(Sponsorship)
}
