package layout

import model.Trail

object SlowOrFastByTrails {
  val SlowTags = Set(
    "type/cartoon",
    "type/gallery",
    "type/picture",
    "lifeandstyle/series/last-bites",
    "artanddesign/photography",
  )

  val FrequencyThreshold = 0.8

  def isSlow(trails: Seq[Trail]): Boolean = {
    val histogram = TagHistogram.fromTrails(trails)

    SlowTags exists { tag => histogram.frequency(tag) > FrequencyThreshold }
  }
}
