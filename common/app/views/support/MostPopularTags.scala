package views.support

import com.gu.facia.api.models.FaciaContent
import common.Seqs._
import model.Tag
import implicits.FaciaContentImplicits._

object MostPopularTags {
  /** A descending list of the tags that occur most frequently within the given items of content and how frequently
    * they occur
    */
  def apply(items: Seq[FaciaContent]): Seq[(Tag, Int)] =
    items
      .flatMap(_.tags.map(Tag.make(_)))
      .filter(_.isKeyword)
      .filterNot(_.isSectionTag)
      .frequencies
      .toSeq
      .sortBy(-_._2)

  /** The top n tags that occur for the given items of content */
  def topTags(items: Seq[FaciaContent]) = apply(items).map(_._1)
}
