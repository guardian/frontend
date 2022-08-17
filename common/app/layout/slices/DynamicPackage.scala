package layout.slices

import layout.slices.Story._

object DynamicPackage extends DynamicContainer {
  override protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)
    val snap = byGroup.getOrElse(1, Seq.empty)

    if (snap.nonEmpty) {
      Some((FullMedia50, stories.drop(1)))
    } else {
      None
    }
  }

  override protected def standardSlices(storiesIncludingBackfill: Seq[Story], firstSlice: Option[Slice]): Seq[Slice] = {

    storiesIncludingBackfill.length match {
      case 0     => Nil
      case 1     => Seq(FullMedia100)
      case 2     => Seq(ThreeQuarterQuarter)
      case 3     => Seq(ThreeQuarterTallQuarter2)
      case 4     => Seq(ThreeQuarterTallQuarter1Ql2)
      case 5     => Seq(FullMedia100, QuarterQuarterQuarterQuarter)
      case 6 | 7 => Seq(FullMedia100, QuarterQuarterQuarterQl)
      case 8     => Seq(FullMedia100, QuarterQuarterQuarterQuarter, Ql1Ql1Ql1Ql1)
      // This case doesn't look _quite_ right. We end up with a row of four
      // and then a row of three, slightly stretched. There isn't a layout
      // which caters for this currently, we'll follow up on this separately.
      case _ => Seq(FullMedia100, QuarterQuarterQuarterQuarter, Ql1Ql1Ql1Ql1)

    }
  }
}
