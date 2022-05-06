package layout.slices

import org.scalatest.matchers.should.Matchers
import org.scalatest.OptionValues._
import common.Seqs._
import layout.slices.ArbitraryStories._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatestplus.scalacheck.ScalaCheckDrivenPropertyChecks

/** Tests for common behaviour between the Dynamic Fast and Dynamic Slow containers -- this is mostly respecting error
  * conditions and the optional first slice, which appears for the same size combinations for either container.
  */
trait DynamicContainerTest extends AnyFlatSpec with Matchers with ScalaCheckDrivenPropertyChecks {
  val slicesFor: Seq[Story] => Option[Seq[Slice]]

  "slicesFor" should "return None for a non-descending list of groups" in {
    forAll { xs: Seq[Int] =>
      whenever(!xs.isDescending) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
    }
  }

  it should "return None for a list of groups that contains a group number greater than 3" in {
    forAll { xs: Seq[Int] =>
      whenever(xs.exists(_ > 3)) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
    }
  }

  it should "return None for a list of groups that contains a group number less than 0" in {
    forAll { xs: Seq[Int] =>
      whenever(xs.exists(_ < 0)) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
    }
  }

  it should "return None for no stories" in {
    slicesFor(Nil) shouldBe None
  }

  it should "return only a single slice when no items are in the very big (2) or huge (3) groups" in {
    forAll(storySeqGen(1)) { stories: Seq[Story] =>
      whenever(stories.nonEmpty) { slicesFor(stories).value should have length 1 }
    }
  }

  it should "return two slices when there are items in the very big or huge groups and there are more than 2 stories" in {
    forAll { stories: Seq[Story] =>
      whenever(stories.length > 2 && stories.exists(_.group > 1)) {
        slicesFor(stories).value should have length 2
      }
    }
  }

  /** This test should cover all of the above cases for the normal slice for when there is an additional slice above */
  it should "for any stories, respecting overflow, follow the same rules for the original slice, except for " +
    "that pesky HalfQuarterQl2Ql4B thing" in {

    forAll { stories: Seq[Story] =>
      val byGroup = Story.segmentByGroup(stories)
      val largerStories = byGroup.getOrElse(3, Seq.empty) ++ byGroup.getOrElse(2, Seq.empty)

      whenever(largerStories.nonEmpty) {
        val smallerStories = stories.dropWhile(_.group >= 2)

        val overFlows = (if (byGroup.contains(3)) {
                           byGroup(3).drop(1) ++ byGroup.getOrElse(2, Seq.empty)
                         } else {
                           byGroup.getOrElse(2, Seq.empty).drop(2)
                         }).map(_.copy(group = 1))

        slicesFor(stories).value
          .lift(1)
          .map(xs =>
            Seq(xs match {
              case HalfQuarterQl2Ql4B => HalfQuarterQl2Ql4
              case other              => other
            }),
          ) shouldEqual slicesFor(overFlows ++ smallerStories)
      }
    }
  }

  it should "for 0 huge and n >= 2 very big, with 1st boosted, return ThreeQuarterQuarter as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(
        Story(2, isBoosted = true) +: Story.unboosted(2) +: stories,
      ).value.headOption.value shouldEqual ThreeQuarterQuarter
    }
  }

  it should "for 0 huge and n >= 2 very big, with 2nd boosted, return QuarterThreeQuarter as the optional 1st slice" in {
    forAll(storySeqGen(1)) { stories: Seq[Story] =>
      slicesFor(
        Story.unboosted(2) +: Story(2, isBoosted = true) +: stories,
      ).value.headOption.value shouldEqual QuarterThreeQuarter
    }
  }

  it should "for 0 huge and n >= 2 very big, without boosting, return HalfHalf as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(Seq.fill(2)(Story.unboosted(2)) ++ stories).value.headOption.value shouldEqual HalfHalf
    }
  }

  it should "for 0 huge and n >= 2 very big, with first 2 boosted, return HalfHalf as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(Seq.fill(2)(Story(2, isBoosted = true)) ++ stories).value.headOption.value shouldEqual HalfHalf
    }
  }

  it should "for 0 huge and one very big, return FullThreeQuarterImage as the optional first slice" in {
    forAll { stories: Seq[Story] =>
      slicesFor(Story.unboosted(2) +: stories.dropWhile(_.group >= 2)).value.headOption.value shouldEqual FullMedia75
    }
  }

  it should "for any number of huge stories >= 1, return FullMedia75 as the optional first slice" in {
    forAll { stories: Seq[Story] =>
      whenever(stories.headOption.exists(_.group == 3)) {
        slicesFor(stories).value.headOption.value shouldEqual FullMedia100
      }
    }
  }
}
