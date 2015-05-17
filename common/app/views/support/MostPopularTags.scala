package views.support

import common.Seqs._
import model.{Content, Tag}

object MostPopularTags {
  /** A descending list of the tags that occur most frequently within the given items of content and how frequently
    * they occur
    */
  def apply(items: Seq[Content]): Seq[(Tag, Int)] =
    items.foldLeft(List.empty[Tag])(_ ++ _.tags)
      .filter(_.isKeyword)
      .filterNot(_.isSectionTag)
      .frequencies
      .toSeq
      .sortBy(-_._2)

  /** The top n tags that occur for the given items of content */
  def topTags(items: Seq[Content]) = apply(items).map(_._1)
}
