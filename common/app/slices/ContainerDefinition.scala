package slices

import com.gu.facia.api.models.FaciaContent

sealed trait MobileShowMore

case object DesktopBehaviour extends MobileShowMore
case class RestrictTo(items: Int) extends MobileShowMore

object ContainerDefinition {
  val DefaultCards = 6

  def ofSlices(slices: Slice*) = ContainerDefinition(
    slices,
    slicesWithoutMPU = slices,
    mobileShowMore = RestrictTo(6),
    customCssClasses = Set.empty
  )

  def ofSlices(slices: Seq[Slice], slicesWithoutMpu: Seq[Slice]) = ContainerDefinition(
    slices,
    slicesWithoutMpu,
    mobileShowMore = RestrictTo(6),
    customCssClasses = Set.empty
  )

  def fromContainer(container: Container, items: Seq[FaciaContent]) = container match {
    case Dynamic(dynamicContainer) =>
      dynamicContainer.containerDefinitionFor(items.map(Story.fromFaciaContent))

    case Fixed(containerDefinition) => Some(containerDefinition)

    case _ => None
  }

  /** Fast container that looks good for the number of items provided */
  def fastForNumberOfItems(n: Int) = n match {
    case 1 => ofSlices(FullMedia50)
    case 2 => ofSlices(HalfHalf2)
    case 3 => ofSlices(TTT)
    case 5 => FixedContainers.fixedSmallSlowVI
    case 6 => ofSlices(QuarterQuarterQuarterQuarter, Ql1Ql1Ql1Ql1)
    case 7 => ofSlices(QuarterQuarterQuarterQuarter, TlTlTl)
    case m if m < 12 => ofSlices(QuarterQuarterQuarterQuarter, Ql1Ql1Ql1Ql1)
    case _ => ofSlices(QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)
  }

  /** Slow container that looks good for the number of items provided */
  def slowForNumberOfItems(n: Int) = n match {
    case 1 => ofSlices(FullMedia75)
    case 2 => ofSlices(HalfHalf2)
    case 3 => ofSlices(TTT)
    case 4 => ofSlices(QuarterQuarterQuarterQuarter)
    case 5 => ofSlices(HalfHalf2, TTT)
    case 6 => ofSlices(TTT, TTT)
    case 7 => ofSlices(TTT, QuarterQuarterQuarterQuarter)
    case _ => ofSlices(QuarterQuarterQuarterQuarter, QuarterQuarterQuarterQuarter)
  }
}

case class ContainerDefinition(
  slices: Seq[Slice],
  slicesWithoutMPU: Seq[Slice],
  mobileShowMore: MobileShowMore,
  customCssClasses: Set[String]
) {
  def numItems = slices.map(_.layout.numItems).sum

  def isSingleton = slices.length == 1 && numItems == 1
}
