package slices

import model.Content

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
}

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore

case class ContainerDefinition(
  slices: Seq[Slice],
  mobileShowMore: MobileShowMore
)
