package layout.slices

import layout.slices.ArbitraryStories.arbitraryStories
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatestplus.scalacheck.ScalaCheckDrivenPropertyChecks
import test.ConfiguredTestSuite

@DoNotDiscover class StoryTest
    extends AnyFlatSpec
    with Matchers
    with ScalaCheckDrivenPropertyChecks
    with ConfiguredTestSuite {
  "segmentByGroup" should "preserve order" in {
    forAll { stories: Seq[Story] =>
      val segmented = Story.segmentByGroup(stories)

      Seq(3, 2, 1, 0).foldLeft(Seq.empty[Story]) { (acc, groupNumber) =>
        acc ++ segmented.getOrElse(groupNumber, Seq.empty)
      } shouldEqual stories
    }
  }
}
