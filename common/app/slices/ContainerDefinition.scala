package slices

object ContainerDefinition {
  val DefaultCards = 6

  def ofSlices(slices: Slice*) = ContainerDefinition(
    slices,
    DefaultCards
  )
}

case class ContainerDefinition(
  slices: Seq[Slice],
  numberOfCardsForMobile: Int
)
