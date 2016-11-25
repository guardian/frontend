package slices

import common.Seqs._
import org.scalacheck.{Gen, Arbitrary}

object ArbitraryStories {
  def storyGen(maxGroup: Int) = for {
    group <- Gen.choose(0, maxGroup)
    isBoosted <- Arbitrary.arbitrary[Boolean]
  } yield Story(group, isBoosted)

  def storySeqGen(maxGroup: Int) =
    Gen.listOf(storyGen(maxGroup)).map(_.reverseSorted)

  implicit val arbitraryStory: Arbitrary[Story] = Arbitrary {
    storyGen(3)
  }

  implicit val arbitraryStories: Arbitrary[Seq[Story]] = Arbitrary {
    storySeqGen(3)
  }
}
