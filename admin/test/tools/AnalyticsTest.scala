package tools

import org.scalatest.FeatureSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateMidnight

class AnalyticsTest extends FeatureSpec with ShouldMatchers {

  feature("Analytics") {

    scenario("getSwipeABTestVariantCountsPerDay") {
      val csvData = Some(
        "B,2013,08,31,4\nF,2013,08,31,2\nB,2013,09,01,3\nD,2013,09,01,5\nE,2013,09,01,2\nA,2013,09,02,3\nB,2013,09,02,7\nD,2013,09,02,1\n"
      )
      val data = Map(
        new DateMidnight("2013-08-31") -> List(("B", 4L), ("F", 2L)),
        new DateMidnight("2013-09-01") -> List(("B", 3L), ("D", 5L), ("E", 2L)),
        new DateMidnight("2013-09-02") -> List(("A", 3L), ("B", 7L), ("D", 1L)))

      Analytics.getSwipeABTestAvgPageViewsPerSessionByVariantByDay(csvData) should equal(data)
    }
  }
}
