package model.dotcomrendering

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class PuzzleItem(
    id: String,
    title: String,
    `type`: String,
    set: String,
    cardVariant: String,
    cadence: Option[String] = None,
    url: Option[String] = None,
    image: Option[String] = None,
    slug: Option[String] = None,
    index: Option[Int] = None,
    variant: Option[String] = None,
    backgroundColour: Option[String] = None,
    filterId: Option[String] = None,
)

object PuzzleItem {
  val SupportedCardVariants: Set[String] = Set("large", "primary", "compact", "archive")

  private val reads: Reads[PuzzleItem] = Json
    .reads[PuzzleItem]
    .filter(JsonValidationError("puzzle id must be a lowercase kebab-case identifier"))(
      _.id.matches("[a-z0-9]+(?:-[a-z0-9]+)*"),
    )
    .filter(JsonValidationError(s"cardVariant must be one of ${SupportedCardVariants.toSeq.sorted.mkString(", ")}"))(
      item => SupportedCardVariants.contains(item.cardVariant),
    )
    .filter(JsonValidationError("cadence is required for non-archive puzzle cards"))(item =>
      item.cardVariant == "archive" || item.cadence.exists(_.trim.nonEmpty),
    )
  private val writes: OWrites[PuzzleItem] = Json.writes[PuzzleItem].transform(removeNullFields)
  implicit val format: OFormat[PuzzleItem] = OFormat(reads, writes)

  private def removeNullFields(json: JsObject): JsObject =
    JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzleContent(
    items: Seq[Seq[PuzzleItem]],
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
    id: String,
    title: String,
    variant: Option[String] = None,
    content: PuzzleContent,
    filterId: Option[String] = None,
    desktopSpan: Option[Int] = None,
)

object PuzzleContainer {
  val SupportedVariants: Set[String] = Set("featured", "standard")

  private lazy val reads: Reads[PuzzleContainer] = (
    (__ \ "id").read[String] and
      (__ \ "title").read[String] and
      (__ \ "variant").readNullable[String] and
      (__ \ "content").lazyRead[PuzzleContent](PuzzleContent.format) and
      (__ \ "filterId").readNullable[String] and
      (__ \ "desktopSpan").readNullable[Int]
  )(PuzzleContainer.apply _).filter(JsonValidationError("container variant or desktopSpan is unsupported"))(container =>
    container.id.matches("[a-z0-9]+(?:-[a-z0-9]+)*") &&
      container.variant.forall(SupportedVariants.contains) &&
      container.desktopSpan.forall(span => span >= 1 && span <= 12),
  )

  private lazy val writes: OWrites[PuzzleContainer] = (
    (__ \ "id").write[String] and
      (__ \ "title").write[String] and
      (__ \ "variant").writeNullable[String] and
      (__ \ "content").lazyWrite[PuzzleContent](PuzzleContent.format) and
      (__ \ "filterId").writeNullable[String] and
      (__ \ "desktopSpan").writeNullable[Int]
  )(unlift(PuzzleContainer.unapply))

  implicit lazy val format: OFormat[PuzzleContainer] = OFormat(reads, writes)
}

case class PuzzleFilter(
    id: String,
    title: String,
    target: String,
    backgroundColour: Option[String] = None,
)

object PuzzleFilter {
  private val reads: Reads[PuzzleFilter] = Json
    .reads[PuzzleFilter]
    .filter(JsonValidationError("navigation id must be a lowercase kebab-case identifier"))(
      _.id.matches("[a-z0-9]+(?:-[a-z0-9]+)*"),
    )
    .filter(JsonValidationError("navigation target must be a section anchor or an internal /puzzles path"))(filter =>
      filter.target.startsWith("#") || filter.target.startsWith("/puzzles"),
    )
  private val writes: OWrites[PuzzleFilter] = Json.writes[PuzzleFilter].transform(removeNullFields)
  implicit val format: OFormat[PuzzleFilter] = OFormat(reads, writes)

  private def removeNullFields(json: JsObject): JsObject =
    JsObject(json.fields.filterNot(_._2 == JsNull))
}

case class PuzzlesLayout(
    containers: Seq[PuzzleContainer],
    filters: Seq[PuzzleFilter] = Seq.empty,
)

object PuzzlesLayout {
  private val rawFormat: OFormat[PuzzlesLayout] = Json.format[PuzzlesLayout]

  private val reads: Reads[PuzzlesLayout] = rawFormat.flatMap { layout =>
    Reads { _ =>
      validationErrors(layout) match {
        case Seq()  => JsSuccess(layout)
        case errors => JsError(errors.map(error => JsPath -> Seq(JsonValidationError(error))))
      }
    }
  }

  implicit lazy val format: OFormat[PuzzlesLayout] = OFormat(reads, rawFormat)

  def validationErrors(layout: PuzzlesLayout): Seq[String] = {
    val containers = flattenContainers(layout.containers)
    val items = containers.flatMap(container => container.content.items.flatten ++ container.content.archive.toSeq)
    val filterIds = layout.filters.map(_.id)
    val containerIds = containers.map(_.id)
    val itemIds = items.map(_.id)
    val anchorTargets = layout.filters.map(_.target).filter(_.startsWith("#")).map(_.drop(1))
    val referencedFilterIds = containers.flatMap(_.filterId) ++ items.flatMap(_.filterId)

    duplicateValues("filter", filterIds) ++
      duplicateValues("container", containerIds) ++
      duplicateValues("puzzle", itemIds) ++
      anchorTargets
        .filterNot(containerIds.contains)
        .distinct
        .map(target => s"navigation target '#$target' has no container") ++
      referencedFilterIds.filterNot(filterIds.contains).distinct.map(id => s"filterId '$id' is not defined") ++
      items.collect {
        case item if item.cardVariant == "archive" && !containers.exists(_.content.archive.contains(item)) =>
          s"puzzle '${item.id}' uses archive presentation outside an archive slot"
        case item if item.cardVariant != "archive" && containers.exists(_.content.archive.contains(item)) =>
          s"archive '${item.id}' must use the archive cardVariant"
      }
  }

  private def flattenContainers(containers: Seq[PuzzleContainer]): Seq[PuzzleContainer] =
    containers ++ containers.flatMap(container => flattenContainers(container.content.nestedContainers))

  private def duplicateValues(label: String, values: Seq[String]): Seq[String] =
    values
      .groupBy(identity)
      .collect {
        case (value, occurrences) if occurrences.size > 1 =>
          s"duplicate $label id '$value'"
      }
      .toSeq
      .sorted
}
