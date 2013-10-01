package tools.charts

import org.scalatest.FeatureSpec
import org.scalatest.matchers.ShouldMatchers
import tools.DataPoint

class ABTestResultGraphTest extends FeatureSpec with ShouldMatchers {

  feature("ABTestResultGraph") {

    val testGraph = new ABTestResultGraph {
      def name = "test"

      val dataLocation = "nowhere"
    }

    val data = List(
      (1524, "control", 17.3),
      (1534, "B", 27.3),
      (1537, "control", 34167.3),
      (1534, "A", 7.3),
      (1536, "B", 45.45541),
      (1533, "control", 112.1234),
      (1533, "B", 1112.1234),
      (1535, "A", 3.2345),
      (1535, "B", 23.234),
      (1535, "control", 3.234),
      (1536, "control", 451.4554),
      (1536, "A", 45.4554),
      (1537, "A", 54167.3),
      (1537, "B", 1687.3),
      (1533, "A", 12.1234),
      (1534, "control", 17.3),
      (1524, "B", 27.3),
      (1527, "control", 34167.3),
      (1524, "A", 7.3),
      (1526, "B", 45.45541),
      (1523, "control", 112.1234),
      (1523, "B", 1112.1234),
      (1525, "A", 3.2345),
      (1525, "B", 23.234),
      (1525, "control", 3.234),
      (1526, "control", 451.4554),
      (1526, "A", 45.4554),
      (1527, "A", 54167.3),
      (1527, "B", 1687.3),
      (1523, "A", 12.1234),
      (1538, "A", 2.341)
    )

    scenario("Labels") {
      testGraph.extractLabels(data) should equal(List("Date", "control", "A", "B"))
    }

    scenario("Dataset") {
      val dataset = List(
        DataPoint("04/03", List(112.1234, 12.1234, 1112.1234)),
        DataPoint("05/03", List(17.3, 7.3, 27.3)),
        DataPoint("06/03", List(3.234, 3.2345, 23.234)),
        DataPoint("07/03", List(451.4554, 45.4554, 45.45541)),
        DataPoint("08/03", List(34167.3, 54167.3, 1687.3)),
        DataPoint("14/03", List(112.1234, 12.1234, 1112.1234)),
        DataPoint("15/03", List(17.3, 7.3, 27.3)),
        DataPoint("16/03", List(3.234, 3.2345, 23.234)),
        DataPoint("17/03", List(451.4554, 45.4554, 45.45541)),
        DataPoint("18/03", List(34167.3, 54167.3, 1687.3)),
        DataPoint("19/03", List(0, 2.341, 0)))
      testGraph.buildDataset(data) should equal(dataset)
    }
  }
}
