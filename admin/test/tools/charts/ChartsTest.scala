package tools.charts

import org.scalatest.FeatureSpec
import org.scalatest.matchers.ShouldMatchers
import tools.{DataPoint, SwipeABTestResultsGraph}
import org.joda.time.DateMidnight

class ChartsTest extends FeatureSpec with ShouldMatchers {

  feature("SwipeABTestOutcomeGraph") {

    val data = Map(
      new DateMidnight("2013-08-31") -> List(("A", 4.2),("B", 4.2),("C", 4.2),("D", 4.2),("E", 4.2), ("F", 2.3)),
      new DateMidnight("2013-09-01") -> List(("A", 3.0), ("B", 3.0), ("C", 3.0), ("D", 3.0), ("E", 5.7), ("F", 2.9)),
      new DateMidnight("2013-09-02") -> List(("A", 3.4), ("B", 7.3), ("C", 1.1), ("D", 1.1), ("E", 1.1), ("F", 1.1)))

    scenario("Labels") {
      SwipeABTestResultsGraph.extractLabels(data) should equal(List("Date", "A", "B", "C", "D", "E", "F"))
    }

    scenario("Dataset") {
      val dataset = List(
        DataPoint("31/08", List(4.2, 4.2, 4.2, 4.2, 4.2, 2.3)),
        DataPoint("01/09", List(3.0, 3.0, 3.0, 3.0, 5.7, 2.9)),
        DataPoint("02/09", List(3.4, 7.3, 1.1, 1.1, 1.1, 1.1)))
      SwipeABTestResultsGraph.buildDataset(data) should equal(dataset)
    }
  }
}
