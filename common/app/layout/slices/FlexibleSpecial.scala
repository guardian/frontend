package layout.slices

import layout.slices.Story._

object FlexibleSpecial extends FlexibleContainer {
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
      case 0 => Nil
      case 1 => Seq(FullMedia100)
      case 2 => Seq(ThreeQuarterQuarter)
      case 3 => Seq(ThreeQuarterTallQuarter2)
      case 4 => Seq(ThreeQuarterTallQuarter1Ql2)
      case 5 => Seq(FullMedia100, QuarterQuarterQuarterQuarter)
      /* We dont support more than 5 slices in a flexible special so if there are more than 5 we only render the 5 layout*/
      case _ => Seq(FullMedia100, QuarterQuarterQuarterQuarter)
    }
  }
}
