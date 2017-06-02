package layout.slices

import common.Seqs._
import org.scalacheck.{Gen, Arbitrary}

object ArbitraryStories {
  def storyGen(maxGroup: Int): Gen[Story] = for {
    group <- Gen.choose(0, maxGroup)
    isBoosted <- Arbitrary.arbitrary[Boolean]
  } yield Story(group, isBoosted)

  def storySeqGen(maxGroup: Int): Gen[Seq[Story]] =
    Gen.listOf(storyGen(maxGroup)).map(_.reverseSorted)

  implicit val arbitraryStory: Arbitrary[Story] = Arbitrary {
    storyGen(3)
  }

  implicit val arbitraryStories: Arbitrary[Seq[Story]] = Arbitrary {
    storySeqGen(3)
  }
}
