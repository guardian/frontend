package slices

import common.Seqs._
import slices.Story._

object DynamicPackage extends DynamicContainer {
  override protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)
    val snap = byGroup.getOrElse(1, Seq.empty)

    if (snap.length > 0) {
      Some((FullMedia50, stories.drop(1)))
    } else {
      None
    }
  }

  override protected def standardSlice(stories: Seq[Story]): Option[Slice] = {
    val BigsAndStandards(bigs, _) = bigsAndStandards(stories)

    if (stories.isEmpty) {
      None
    } else {
      Some(if (stories.length == 1) {
        FullMedia75
      } else if (stories.length == 2) {
        ThreeQuarterQuarter
      } else if (stories.length == 3) {
        ThreeQuarterTallQuarter2
      } else if (stories.length == 4) {
        ThreeQuarterTallQuarter2Ql2
      } else {
        QuarterQuarterQuarterQuarter
      })
    }
  }
}
