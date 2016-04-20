package slices

object CommercialContainerType {
  val all: Map[String, Container] = Map(
    ("commercial/single-campaign", Commercial(SingleCampaign(FixedContainers.fixedSmallSlowIV))),
    ("commercial/multi-campaign", Commercial(MultiCampaign(FixedContainers.fixedSmallSlowIV)))
  )
}

sealed trait CommercialContainerType

case class SingleCampaign(get: ContainerDefinition) extends CommercialContainerType
case class MultiCampaign(get: ContainerDefinition) extends CommercialContainerType
