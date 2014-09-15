package slices

import common.Seqs._

object DynamicFast {
  import Story.segmentByGroup

  /** Maybe the optional additional first slice and the remaining stories */
  private def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)

    val huges = byGroup.getOrElse(3, Seq.empty)
    val veryBigs = byGroup.getOrElse(2, Seq.empty)

    if (huges.length > 0) {
      Some((Godzilla, stories.drop(1)))
    } else if (veryBigs.length == 1) {
      Some((Mechagodzilla, stories.drop(1)))
    } else if (veryBigs.length >= 2) {
      val storiesInSlice = veryBigs.take(2)

      if (storiesInSlice.map(_.isBoosted).distinct.length == 1) {
        Some((Negadon, stories.drop(2)))
      } else if (storiesInSlice(0).isBoosted) {
        Some((Rodan, stories.drop(2)))
      } else {
        Some((Pulgasari, stories.drop(2)))
      }
    } else {
      None
    }
  }

  private def standardSlice(stories: Seq[Story]): Option[Slice] = {
    val byGroup = segmentByGroup(stories)
    val bigs = byGroup.getOrElse(3, Seq.empty) ++
      byGroup.getOrElse(2, Seq.empty) ++
      byGroup.getOrElse(1, Seq.empty)

    val isFirstBoosted = stories.headOption.exists(_.isBoosted)

    if (stories.isEmpty) {
      None
    } else {
      Some(
        if (stories.forall(_.group == 0)) {
          Mothra
        } else if (isFirstBoosted) {
          bigs.length match {
            case 1 => Ghidorah
            case _ => Anguirus
          }
        } else {
          bigs.length match {
            case 1 => Reptilicus
            case 2 => Gappa
            case 3 => Daimajin
            case _ => Ultraman
          }
        }
      )
    }
  }

  def slicesFor(stories: Seq[Story]): Option[Seq[Slice]] = {
    if (stories.isDescending && stories.forall(story => story.group >= 0 && story.group <= 3)) {
      optionalFirstSlice(stories) map { case (firstSlice, remaining) =>
        Some(Seq(Some(firstSlice), standardSlice(remaining)).flatten)
      } getOrElse {
        standardSlice(stories).map(Seq(_))
      }
    } else {
      None
    }
  }
}
