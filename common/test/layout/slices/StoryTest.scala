package layout.slices

import org.scalatest.prop.GeneratorDrivenPropertyChecks
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import ArbitraryStories._
import test.ConfiguredTestSuite

@DoNotDiscover class StoryTest
    extends FlatSpec
    with Matchers
    with GeneratorDrivenPropertyChecks
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
