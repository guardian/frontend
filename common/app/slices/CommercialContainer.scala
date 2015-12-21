package slices

object CommercialContainer {
  val all: Map[String, Container] = Map(
    ("commercial/single-campaign", Commercial(SingleCampaign(FixedContainers.fixedSmallSlowIV))),
    ("commercial/multi-campaign", Commercial(MultiCampaign(FixedContainers.fixedSmallSlowIV)))
  )
}

sealed trait CommercialContainer

case class SingleCampaign(get: ContainerDefinition) extends CommercialContainer
case class MultiCampaign(get: ContainerDefinition) extends CommercialContainer
