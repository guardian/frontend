package diagnostics

import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import model.diagnostics.Metric

class MetricTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    Metric.reset()
  }

  "Metric" should "increment values" in {
    Metric.increment("foo") should be (1)
    Metric.increment("foo") should be (2)

    Metric.reset()

    Metric.increment("foo") should be (1)
  }

  it should "work out averages" in {

    (1 to 5).foreach(i => Metric.increment("foo"))
    (1 to 10).foreach(i => Metric.increment("bar"))

    Metric.averages("foo") should === (0.3333333333333333)
    Metric.averages("bar") should === (0.6666666666666666)
  }

}
