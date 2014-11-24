package slices

import model.Content

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore

object ContainerDefinition {
  val DefaultCards = 6

  def ofSlices(slices: Slice*) = ContainerDefinition(
    slices,
    RestrictTo(6)
  )

  def fromContainer(container: Container, items: Seq[Content]) = container match {
    case Dynamic(dynamicContainer) =>
      dynamicContainer.containerDefinitionFor(items.map(Story.fromContent))

    case Fixed(containerDefinition) => Some(containerDefinition)

    case _ => None
  }

  /** Fixed container that looks good for the number of items provided */
  def forNumberOfItems(n: Int) = n match {
    case 1 => ContainerDefinition.ofSlices(FullMedia50)
    case 2 => ContainerDefinition.ofSlices(HalfHalf2)
    case 3 => FixedContainers.fixedMediumSlowXIIMpu
    case 5 => FixedContainers.fixedSmallSlowVI
    case _ => FixedContainers.fixedMediumFastXII
  }
}

case class ContainerDefinition(
  slices: Seq[Slice],
  mobileShowMore: MobileShowMore
)
