package model.dotcomrendering

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class PuzzleItem(
    title: String,
    `type`: String,
    set: String,
    url: Option[String] = None,
    image: Option[String] = None,
    slug: Option[String] = None,
    index: Option[Int] = None,
    variant: Option[String] = None,
    backgroundColour: Option[String] = None,
    filterId: Option[String] = None,
)

object PuzzleItem {
  private val reads: Reads[PuzzleItem] = Json.reads[PuzzleItem]
  private val writes: OWrites[PuzzleItem] = Json.writes[PuzzleItem].transform(removeNullFields)
  implicit val format: OFormat[PuzzleItem] = OFormat(reads, writes)

  private def removeNullFields(json: JsObject): JsObject = JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzleContent(
    title: Seq[Seq[String]],
    nestedContainers: Seq[PuzzleContainer],
    archive: Option[PuzzleItem] = None,
)

object PuzzleContent {
  implicit lazy val format: OFormat[PuzzleContent] = (
    (__ \ "items").format[Seq[Seq[PuzzleItem]]] and
      (__ \ "nestedContainers").lazyFormat[Seq[PuzzleContainer]](Format.of[Seq[PuzzleContainer]]) and
      (__ \ "archive").formatNullable[PuzzleItem]
  )(PuzzleContent.apply, unlift(PuzzleContent.unapply))
}

case class PuzzleContainer(
    title: String,
    variant: Option[String] = None,
    content: PuzzleContent,
    filterId: Option[String] = None,
    desktopSpan: Option[Int] = None,
)

object PuzzleContainer {
  implicit lazy val format: OFormat[PuzzleContainer] = (
    (__ \ "title").format[String] and
      (__ \ "variant").formatNullable[String] and
      (__ \ "content").lazyFormat[PuzzleContent](PuzzleContent.format) and
      (__ \ "filterId").formatNullable[String] and
      (__ \ "desktopSpan").formatNullable[Int]
  )(PuzzleContainer.apply, unlift(PuzzleContainer.unapply))
}

case class PuzzleFilter(
    id: String,
    title: String,
    backgroundColour: Option[String] = None,
)

object PuzzleFilter {
  private val reads: Reads[PuzzleFilter] = Json.reads[PuzzleFilter]
  private val writes: OWrites[PuzzleFilter] = Json.writes[PuzzleFilter].transform(removeNullFields)
  implicit val format: OFormat[PuzzleFilter] = OFormat(reads, writes)

  private def removeNullFields(json: JsObject): JsObject = JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzlesLayout(
    containers: Seq[PuzzleContainer],
    filters: Seq[PuzzleFilter] = Seq.empty,
)

object PuzzlesLayout {
  implicit lazy val format: OFormat[PuzzlesLayout] = Json.format[PuzzlesLayout]
}
