package layout.slices

import ArbitraryStories._
import org.scalatest.DoNotDiscover
import org.scalatest.OptionValues._
import org.scalacheck.Arbitrary.arbitrary
import common.Seqs._
import test.ConfiguredTestSuite

@DoNotDiscover class DynamicSlowTest extends DynamicContainerTest with ConfiguredTestSuite {
  override val slicesFor: (Seq[Story]) => Option[Seq[Slice]] = DynamicSlow.slicesFor

  it should "for only standard items return Hl4Hl4" in {
    forAll(storySeqGen(0)) { stories: Seq[Story] =>
      whenever(stories.nonEmpty) {
        slicesFor(stories).value.headOption.value shouldEqual Hl4Hl4
      }
    }
  }

  it should "for a single big and n standards, return Hl4Half" in {
    forAll(storySeqGen(0), arbitrary[Boolean]) { (stories: Seq[Story], isBoosted: Boolean) =>
      slicesFor(Story(1, isBoosted) +: stories).value.headOption.value shouldEqual Hl4Half
    }
  }

  it should "for n > 1 bigs and m standards, return Hl4QuarterQuarter" in {
    forAll(storySeqGen(1)) { stories: Seq[Story] =>
      val bigs = stories.countWhile(_.group == 1)

      whenever(bigs > 1) {
        slicesFor(stories).value.headOption.value shouldEqual Hl4QuarterQuarter
      }
    }
  }
}
