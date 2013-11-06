package diagnostics

import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import model.diagnostics.{View, Session}

class ViewTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    View.reset()
    Session.reset()
  }

  "View" should "increment values" in {
    View.increment should be (1)
    View.increment should be (2)
    View.count should be (2)
  }

  "View" should "reset values" in {
    View.increment should be (1)
    View.reset
    View.count should be (0)
  }
  
}
