package slices

import org.scalacheck.Gen
import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{Matchers, FlatSpec}
import DynamicFast.slicesFor
import common.Seqs._
import org.scalatest.OptionValues._
import ArbitraryStories._

class DynamicFastTest extends FlatSpec with Matchers with GeneratorDrivenPropertyChecks {
  "slicesFor" should "return None for a non-descending list of groups" in {
    forAll { xs: Seq[Int] =>
      whenever (!xs.isDescending) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
    }
  }

  it should "return None for a list of groups that contains a group number greater than 3" in {
    forAll { xs: Seq[Int] =>
      whenever (xs.exists(_ > 3)) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
    }
  }

  it should "return None for a list of groups that contains a group number less than 0" in {
    forAll { xs: Seq[Int] =>
      whenever (xs.exists(_ < 0)) { slicesFor(xs.map(Story.unboosted)) shouldBe None }
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

  it should "for n standard (0) items return Mothra" in {
    forAll(Gen.choose(1, 20)) { n: Int =>
      slicesFor(Seq.fill(n)(0).map(Story.unboosted)).value shouldEqual Seq(
        Mothra
      )
    }
  }

  it should "for one big unboosted item and n standard return Reptilicus" in {
    forAll(Gen.choose(0, 20)) { n: Int =>
      slicesFor((1 +: Seq.fill(n)(0)).map(Story.unboosted)).value shouldEqual Seq(
        Reptilicus
      )
    }
  }

  it should "for two big unboosted items and m standard return Gappa" in {
    forAll(Gen.choose(0, 20)) { m: Int =>
      slicesFor((Seq.fill(2)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        Gappa
      )
    }
  }

  it should "for three big unboosted items and m standard return Daimaijin" in {
    forAll(Gen.choose(0, 20)) { m: Int =>
      slicesFor((Seq.fill(3)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        Daimajin
      )
    }
  }

  it should "for n > 3 big unboosted items and m standard return Ultraman" in {
    forAll(Gen.choose(4, 20), Gen.choose(0, 20)) { (n: Int, m: Int) =>
      slicesFor((Seq.fill(n)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        Ultraman
      )
    }
  }

  it should "for one big boosted item and n standard return Ghidorah" in {
    forAll(Gen.choose(1, 20)) { n: Int =>
      slicesFor(Story(1, isBoosted = true) +: Seq.fill(n)(Story.unboosted(0))).value shouldEqual Seq(
        Ghidorah
      )
    }
  }

  it should "for one big boosted, n >= 1 big, and m standards, return Anguirus" in {
    forAll(Gen.choose(1, 20), Gen.choose(1, 20)) { (m: Int, n: Int) =>
      slicesFor(
        Story(1, isBoosted = true) +:
          (Seq.fill(m)(Story.unboosted(1)) ++
            Seq.fill(n)(Story.unboosted(0)))).value shouldEqual Seq(Anguirus)
    }
  }

  /** This test should cover all of the above cases for the normal slice for when there is an additional slice above */
  it should "for any stories, respecting overflow, follow the same rules for the original slice" in {
    // You can have more very bigs and huges than these but they overflow into the size below
    val maximumVeryBigs = 2
    val maximumHuges = 1

    forAll { stories: Seq[Story] =>
      val byGroup = Story.segmentByGroup(stories)
      val largerStories = byGroup.getOrElse(3, Seq.empty) ++ byGroup.getOrElse(2, Seq.empty)

      whenever(largerStories.length > 0) {
        val smallerStories = stories.dropWhile(_.group >= 2)

        val overFlows = (if (byGroup.contains(3)) {
          byGroup(3).drop(1) ++ byGroup.getOrElse(2, Seq.empty)
        } else {
          byGroup.getOrElse(2, Seq.empty).drop(2)
        }).map(_.copy(group = 1))

        slicesFor(stories).value.lift(1).map(Seq(_)) shouldEqual slicesFor(overFlows ++ smallerStories)
      }
    }
  }

  it should "for 0 huge and n >= 2 very big, with 1st boosted, return Rodan as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(
        Story(2, isBoosted = true) +: Story.unboosted(2) +: stories
      ).value.headOption.value shouldEqual Rodan
    }
  }

  it should "for 0 huge and n >= 2 very big, with 2nd boosted, return Pulgasari as the optional 1st slice" in {
    forAll(storySeqGen(1)) { stories: Seq[Story] =>
      slicesFor(
        Story.unboosted(2) +: Story(2, isBoosted = true) +: stories
      ).value.headOption.value shouldEqual Pulgasari
    }
  }

  it should "for 0 huge and n >= 2 very big, without boosting, return Negadon as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(Seq.fill(2)(Story.unboosted(2)) ++ stories).value.headOption.value shouldEqual Negadon
    }
  }

  it should "for 0 huge and n >= 2 very big, with first 2 boosted, return Negadon as the optional 1st slice" in {
    forAll(storySeqGen(2)) { stories: Seq[Story] =>
      slicesFor(Seq.fill(2)(Story(2, isBoosted = true)) ++ stories).value.headOption.value shouldEqual Negadon
    }
  }

  it should "for 0 huge and one very big, return Mechagodzilla as the optional first slice" in {
    forAll { stories: Seq[Story] =>
      slicesFor(Story.unboosted(2) +: stories.dropWhile(_.group >= 2)).value.headOption.value shouldEqual Mechagodzilla
    }
  }

  it should "for any number of huge stories >= 1, return Godzilla as the optional first slice" in {
    forAll { stories: Seq[Story] =>
      whenever(stories.headOption.exists(_.group == 3)) {
        slicesFor(stories).value.headOption.value shouldEqual Godzilla
      }
    }
  }
}

