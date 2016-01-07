package layout

import implicits.Collections
import model.Trail
import model.pressed.PressedContent
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper

object TagHistogram extends Collections {
  def fromTrails(trails: Seq[Trail]): TagHistogram = TagHistogram(trails.foldLeft(Map.empty[String, Int]) {
    case (histogram, trail) =>
      trail.tags.tags.map(_.id).toSet.foldLeft(histogram) {
        case (hist, tagId) =>
          hist + (tagId -> (hist.getOrElse(tagId, 0) + 1))
      }
  }, trails.length)

  def fromFaciaContent(faciaContentList: Seq[PressedContent]): TagHistogram = TagHistogram(faciaContentList.foldLeft(Map.empty[String, Int]) {
    case (histogram, faciaContent) =>
      faciaContent.frontendTags.map(_.id).toSet.foldLeft(histogram) {
        case (hist, tagId) =>
          hist + (tagId -> (hist.getOrElse(tagId, 0) + 1))
      }
  }, faciaContentList.length)
}

case class TagHistogram(frequencyById: Map[String, Int], numberOfItems: Int) {
  def frequency(id: String): Double =
    if (numberOfItems == 0)
      0
    else
      frequencyById.get(id) map { _.toDouble / numberOfItems } getOrElse 0d
}

object SlowOrFastByTrails {
  val SlowTags = Set(
    "type/cartoon",
    "type/gallery",
    "type/picture",
    "lifeandstyle/series/last-bites",
    "artanddesign/photography"
  )

  val FrequencyThreshold = 0.8

  def isSlow(trails: Seq[Trail]) = {
    val histogram = TagHistogram.fromTrails(trails)

    SlowTags exists { tag => histogram.frequency(tag) > FrequencyThreshold }
  }
}
