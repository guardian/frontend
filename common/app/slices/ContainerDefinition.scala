package slices

object ContainerDefinition {
  val DefaultCards = 6

  def ofSlices(slices: Slice*) = ContainerDefinition(
    slices,
    RestrictTo(6)
  )
}

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore

case class ContainerDefinition(
  slices: Seq[Slice],
  mobileShowMore: MobileShowMore
)
