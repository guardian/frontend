package views.support

import common.Seqs._
import model.Tag
import model.pressed.PressedContent
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper

object MostPopularTags {
  /** A descending list of the tags that occur most frequently within the given items of content and how frequently
    * they occur
    */
  def apply(items: Seq[PressedContent]): Seq[(Tag, Int)] =
    items
      .flatMap(_.frontendTags)
      .filter(_.isKeyword)
      .filterNot(_.isSectionTag)
      .frequencies
      .toSeq
      .sortBy(-_._2)

  /** The top n tags that occur for the given items of content */
  def topTags(items: Seq[PressedContent]) = apply(items).map(_._1)
}
