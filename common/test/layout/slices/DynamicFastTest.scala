package layout.slices

import org.scalacheck.Gen
import org.scalatest.DoNotDiscover
import org.scalatest.OptionValues._
import test.ConfiguredTestSuite

@DoNotDiscover class DynamicFastTest extends DynamicContainerTest with ConfiguredTestSuite {
  override val slicesFor: (Seq[Story]) => Option[Seq[Slice]] = DynamicFast.slicesFor

  it should "for n standard (0) items return Ql3Ql3Ql3Ql3" in {
    forAll(Gen.choose(1, 20)) { n: Int =>
      slicesFor(Seq.fill(n)(0).map(Story.unboosted)).value shouldEqual Seq(
        Ql3Ql3Ql3Ql3,
      )
    }
  }

  it should "for one big unboosted item and n standard return QuarterQlQlQl" in {
    forAll(Gen.choose(0, 20)) { n: Int =>
      slicesFor((1 +: Seq.fill(n)(0)).map(Story.unboosted)).value shouldEqual Seq(
        QuarterQlQlQl,
      )
    }
  }

  it should "for two big unboosted items and m standard return QuarterQuarterQlQl" in {
    forAll(Gen.choose(0, 20)) { m: Int =>
      slicesFor((Seq.fill(2)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        QuarterQuarterQlQl,
      )
    }
  }

  it should "for three big unboosted items and m standard return QuarterQuarterQuarterQl" in {
    forAll(Gen.choose(0, 20)) { m: Int =>
      slicesFor((Seq.fill(3)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        QuarterQuarterQuarterQl,
      )
    }
  }

  it should "for n > 3 big unboosted items and m standard return QuarterQuarterQuarterQuarter" in {
    forAll(Gen.choose(4, 20), Gen.choose(0, 20)) { (n: Int, m: Int) =>
      slicesFor((Seq.fill(n)(1) ++ Seq.fill(m)(0)).map(Story.unboosted)).value shouldEqual Seq(
        QuarterQuarterQuarterQuarter,
      )
    }
  }

  it should "for one big boosted item and n standard return HalfQl4Ql4" in {
    forAll(Gen.choose(1, 20)) { n: Int =>
      slicesFor(Story(1, isBoosted = true) +: Seq.fill(n)(Story.unboosted(0))).value shouldEqual Seq(
        HalfQl4Ql4,
      )
    }
  }

  it should "for one big boosted, n >= 1 big, and m standards, return HalfQuarterQl2Ql4" in {
    forAll(Gen.choose(1, 20), Gen.choose(1, 20)) { (m: Int, n: Int) =>
      slicesFor(
        Story(1, isBoosted = true) +:
          (Seq.fill(m)(Story.unboosted(1)) ++
          Seq.fill(n)(Story.unboosted(0))),
      ).value shouldEqual Seq(HalfQuarterQl2Ql4)
    }
  }

  it should "for two very bigs, one big boosted, n >= 1 big, and m standards, return HalfHalf, HalfQuarterQl2Ql4B" in {
    forAll(Gen.choose(1, 20), Gen.choose(1, 20)) { (m: Int, n: Int) =>
      slicesFor(
        Seq.fill(2)(Story.unboosted(2)) ++
          Seq(Story(1, isBoosted = true)) ++
          (Seq.fill(m)(Story.unboosted(1)) ++
            Seq.fill(n)(Story.unboosted(0))),
      ).value shouldEqual Seq(
        HalfHalf,
        HalfQuarterQl2Ql4,
      )
    }
  }

  it should "for one very big boosted, one very big unboosted, one big boosted, n >= 1 big, and m standards, " +
    "return ThreeQuarterQuarter, HalfQuarterQl2Ql4B" in {
    forAll(Gen.choose(1, 20), Gen.choose(1, 20)) { (m: Int, n: Int) =>
      slicesFor(
        Seq(
          Story(2, isBoosted = true),
          Story(2, isBoosted = false),
          Story(1, isBoosted = true),
        ) ++
          (Seq.fill(m)(Story.unboosted(1)) ++
            Seq.fill(n)(Story.unboosted(0))),
      ).value shouldEqual Seq(ThreeQuarterQuarter, HalfQuarterQl2Ql4B)
    }
  }
}
