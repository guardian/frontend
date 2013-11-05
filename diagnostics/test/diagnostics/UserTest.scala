package diagnostics

import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import model.diagnostics.View

class ViewTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    View.reset()
  }

  "View" should "increment values" in {
    View.increment should be (1)
    View.increment should be (2)
  }

}

import model.diagnostics.Session

class SessionTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  override def beforeEach() {
    Session.reset()
  }

  "Session" should "increment values" in {
    Session.increment should be (1)
    Session.increment should be (2)
  }

}
