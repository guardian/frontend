package slices

import org.scalacheck.Gen
import org.scalatest.OptionValues._

class DynamicFastTest extends DynamicContainerTest {
  override val slicesFor: (Seq[Story]) => Option[Seq[Slice]] = DynamicFast.slicesFor

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
}

