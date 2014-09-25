package slices

import model.Content

object FixedContainers {
  import ContainerDefinition.{ofSlices => slices}

  val all: Map[String, ContainerDefinition] = Map(
    ("fixed/small/slow-IV", slices(QuarterQuarterQuarterQuarter)),
    ("fixed/small/slow-V-half", slices(Hl4Half)),
    ("fixed/small/slow-V-third", slices(QuarterQuarterHl3)),
    ("fixed/small/slow-VI", slices(TTTL4)),
    ("fixed/small/fast-VIII", slices(QuarterQuarterQlQl)),
    ("fixed/small/fast-X", slices(QuarterQlQlQl)),
    ("fixed/medium/slow-VI", slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter)),
    ("fixed/medium/slow-VII", slices(HalfQQ, QuarterQuarterQuarterQuarter)),
    ("fixed/medium/fast-XI", slices(HalfQQ, Ql2Ql2Ql2Ql2)),
    ("fixed/medium/fast-XII", slices(QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)),
    ("fixed/large/slow-XIV", slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)),
    ("fixed/large/fast-XV", slices(HalfQQ, Ql3Ql3Ql3Ql3))
  )

  def unapply(collectionType: Option[String]): Option[ContainerDefinition] =
    collectionType.flatMap(all.lift)
}

object DynamicContainers {
  val all: Map[String, DynamicContainer] = Map(
    ("dynamic/fast", DynamicFast),
    ("dynamic/slow", DynamicSlow)
  )

  def apply(collectionType: Option[String], items: Seq[Content]): Option[ContainerDefinition] = {
    for {
      typ <- collectionType
      dynamicContainer <- all.get(typ)
      definition <- dynamicContainer.containerDefinitionFor(items.map(Story.fromContent))
    } yield definition
  }
}
