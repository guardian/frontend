package diagnostics

import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import model.diagnostics.{NextGenView, NextGenSession}

class ViewTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    NextGenView.reset()
    NextGenSession.reset()
  }

  "NextGen" should "increment values" in {
    NextGenView.increment should be (1)
    NextGenView.increment should be (2)
    NextGenView.count should be (2)
  }

  "NextGen" should "reset values" in {
    NextGenView.increment should be (1)
    NextGenView.reset
    NextGenView.count should be (0.01)
  }
  
}
