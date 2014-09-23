package slices

object FixedContainers {
  import ContainerDefinition.{ofSlices => slices}

  val all: Map[String, ContainerDefinition] = Map(
    "fixed/small/slow-IV" -> slices(QuarterQuarterQuarterQuarter),
    "fixed/small/slow-V" -> slices(Hl4Half),
    "fixed/small/fast-VIII" -> slices(QuarterQuarterQlQl),
    "fixed/small/fast-X" -> slices(QuarterQlQlQl)
  )

  def unapply(collectionType: Option[String]): Option[ContainerDefinition] =
    collectionType.flatMap(all.lift)
}
