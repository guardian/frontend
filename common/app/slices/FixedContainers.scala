package slices

import play.api.libs.json.Json

object FixedContainers {
  import ContainerDefinition.{ofSlices => slices}

  val all: Map[String, ContainerDefinition] = Map(
    "fixed/small/slow-IV" -> slices(QuarterQuarterQuarterQuarter),
    "fixed/small/slow-V" -> slices(Hl4Half),
    "fixed/small/slow-VI" -> slices(TTTL4),
    "fixed/small/fast-VIII" -> slices(QuarterQuarterQlQl),
    "fixed/small/fast-X" -> slices(QuarterQlQlQl),
    "fixed/medium/slow-VI" -> slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter),
    "fixed/medium/slow-VII" -> slices(HalfQQ, QuarterQuarterQuarterQuarter),
    "fixed/medium/fast-XI" -> slices(HalfQQ, Ql2Ql2Ql2Ql2),
    "fixed/medium/fast-XII" -> slices(QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2),
    "fixed/large/slow-XIV" -> slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2),
    "fixed/large/fast-XV" -> slices(HalfQQ, Ql3Ql3Ql3Ql3)
  )

  val idsJson = Json.stringify(Json.toJson(all.keys.map(id => ContainerJsonConfig(id, None))))

  def unapply(collectionType: Option[String]): Option[ContainerDefinition] =
    collectionType.flatMap(all.lift)
}
