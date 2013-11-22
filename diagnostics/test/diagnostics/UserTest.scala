package diagnostics

import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import model.diagnostics.alpha.{ResponsiveView, ResponsiveSession}

class ViewTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    ResponsiveView.reset()
    ResponsiveSession.reset()
  }

  "NextGen" should "increment values" in {
    ResponsiveView.increment should be (1)
    ResponsiveView.increment should be (2)
    ResponsiveView.count should be (2)
  }

  "NextGen" should "reset values" in {
    ResponsiveView.increment should be (1)
    ResponsiveView.reset
    ResponsiveView.count should be (0.01)
  }
  
}
